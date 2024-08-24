import { redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if (!userData.auth) throw redirect(307, '/salir');
    if (!['super-admin','super-view', 'dependence', 'governor', 'chief'].includes(userData.data.role)) throw redirect(301, '/');
    
    let requestDependences = supabase
        .from('dependences')
        .select('id, name, abbr')
        .order('order_by', { ascending: true })
        .eq('deleted', false);

    const { data: dependences } = await requestDependences;

    const dependencesWithAdmins = await Promise.all(dependences.map(async (dependence) => {
        const { data: admin, error } = await supabase
          .from('admins')
          .select('name, lastname_father, phone, email, photo')
          .eq('dependence', dependence.id)
          .order('created_at', { ascending: true })
          .limit(1)
        
        if (error) {
          return dependence;
        }
      
        return {
          ...dependence,
          admin: admin[0]
        };
      }));

    let requestProjects = supabase.from('projects').select('*').eq('deleted', false);
    const { data: projects } = await requestProjects;

    let requestActions = supabase.from('actions').select('name, id, status, municipalities, dependence, project').eq('level', 1).eq('deleted', false);
    const { data: filteredActions } = await requestActions;

    const actions = filteredActions.filter(action => action.name && action.name.length > 2);

    const projects100Days = projects.filter(project => project.type === '100-days');

    const initializeOrUpdateCounters = (counters, item, isProject100Days = false) => {
        if (!item.dependence || !item.dependence.data || !item.municipalities || !item.municipalities.data) {
            return;
        }

        const dependenceId = item.dependence.data.value;
        if (!counters[dependenceId]) {
            counters[dependenceId] = {
                total: 0,
                real: 0,
                municipalities: {},
                totals_status: { 'active-process': 0, 'finished': 0, 'not-activated': 0, 'approved-waiting': 0, 'waiting-approval': 0 },
                amount: 0,
                finance_source: 0
            };
        }
    
        counters[dependenceId].total += 1;
        counters[dependenceId].totals_status[item.status] += 1;
        counters[dependenceId].amount += item.amount || 0;
        counters[dependenceId].finance_source += Number(item.finance_source_history?.data?.[0]?.source) || 0;
        
        if (item.status === 'finished') {
            counters[dependenceId].real += 1;
        }
    
        item.municipalities.data.forEach(municipality => {
            const municipalityId = municipality.value;
            if (!counters[dependenceId].municipalities[`municipality_${municipalityId}`]) {
                counters[dependenceId].municipalities[`municipality_${municipalityId}`] = {
                    total: 0,
                    real: 0,
                    totals_status: { 'active-process': 0, 'finished': 0, 'not-activated': 0, 'approved-waiting': 0, 'waiting-approval': 0 },
                    amount: 0,
                    finance_source: 0
                };
            }
            counters[dependenceId].municipalities[`municipality_${municipalityId}`].total += 1;
            counters[dependenceId].municipalities[`municipality_${municipalityId}`].totals_status[item.status] += 1;
            counters[dependenceId].municipalities[`municipality_${municipalityId}`].amount += item.amount || 0;
            counters[dependenceId].municipalities[`municipality_${municipalityId}`].finance_source += Number(item.finance_source_history?.data?.[0]?.source) || 0;
            
            if (item.status === 'finished') {
                counters[dependenceId].municipalities[`municipality_${municipalityId}`].real += 1;
            }
        });
    };

    let dependencesCounters = {};
    let projectCounters = {};
    projects.forEach(project => {
        initializeOrUpdateCounters(projectCounters, project);
        initializeOrUpdateCounters(dependencesCounters, project);
    });

    let actionCounters = {};
    actions.forEach(action => {
        initializeOrUpdateCounters(actionCounters, action);
        initializeOrUpdateCounters(dependencesCounters, action);
    });

    let projectCounters100Days = {};
    projects100Days.forEach(project => {
        initializeOrUpdateCounters(projectCounters100Days, project, true);
    });

    const totalProjects = projects.length;
    const realProjects = projects.filter(project => project.status === 'finished').length;
    
    const totalActions = actions.length;
    const realActions = actions.filter(action => action.status === 'finished').length;

    const allData = {
        projects: {
            total: totalProjects,
            real: realProjects,
            details: projectCounters,
            amount: projects.reduce((sum, project) => sum + (project.amount || 0), 0),
            finance_source: projects.reduce((sum, project) => sum + (Number(project.finance_source_history?.data?.[0]?.source) || 0), 0)
        },
        actions: {
            total: totalActions,
            real: realActions,
            details: actionCounters
        },
        projects_100_days: {
            total: projects100Days.length,
            real: projects100Days.filter(project => project.status === 'finished').length,
            details: projectCounters100Days,
            amount: projects100Days.reduce((sum, project) => sum + (project.amount || 0), 0),
            finance_source: projects100Days.reduce((sum, project) => sum + (Number(project.finance_source_history?.data?.[0]?.source) || 0), 0)
        },
        dependencesTotals: dependencesCounters
    };

    projects.forEach(project => {
        const projectActions = actions.filter(action => action.project === project.id);
        project.actions = { list: projectActions };
    });

    const dependences_temp = dependences && dependences.length > 0 ? dependences.map(dependence => ({ label: dependence.name, value: dependence.id, abbr: dependence.abbr, visible: true })) : [];

    let axisRequest = supabase
        .from('axies')
        .select('name, id')
        .eq('deleted', false)

    const { data: axis } = await axisRequest;

    return {
        allData,
        dependences: dependencesWithAdmins,
        projects,
        dependencesList: dependences_temp,
        axis
    };
};