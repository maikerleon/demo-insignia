import { redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'super-view', 'supervisor', 'dependence', 'coordination', 'municipality', 'register'].includes(userData.data.role) ) throw redirect(301, '/');

    let { data: actions } = await supabase
        .from('actions')
        .select('id, name, dependence, start, end, project, type, created_at, municipalities, description, amount, beneficiaries, manager, status, priority')
        .eq('deleted', false)
        .neq('name', '')
        .order('name', { ascending: true });

    let { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('deleted', false)
        .order('name', { ascending: true });

    let { data: dependences } = await supabase
        .from('dependences')
        .select('id, name, abbr')
        .eq('deleted', false)
        .order('name', { ascending: true });
    
    let { data: managers } = await supabase
        .from('admins')
        .select('id, name, lastname_father, photo')
        .eq('role', 'dependence')
        .eq('deleted', false)
        .order('start', { ascending: false });

    const projectsMap = projects.reduce((acc, project) => {
        acc[project.id] = project.name;
        return acc;
    }, {});
        
    const filteredActions = actions
        .filter(action => projectsMap.hasOwnProperty(action.project))
        .filter(action => {
            if (['super-admin', 'super-view'].includes(userData.data.role)) {
            return true;
            } else if (userData.data.role === 'dependence') {
            return action.dependence?.data?.value === userData.data?.dependence;
            } else if (userData.data.role === 'coordination') {
            const actionMunicipalities = action.municipalities.data?.map(municipality => municipality.value) || [];
            return action.dependence?.data?.value === userData.data?.dependence && actionMunicipalities.some(municipalityId => userData.data.coordination.includes(municipalityId));
            } else if (['municipality', 'register'].includes(userData.data.role)) {
            const actionMunicipalities = action.municipalities.data?.map(municipality => municipality.value) || [];
            return action.dependence?.data?.value === userData.data.dependence && actionMunicipalities.includes(userData.data?.municipality);
            }
            return false;
        })
        .map(action => ({
            ...action,
            project_name: projectsMap[action.project]
        }));

    return {
        actions: filteredActions,
        managers: managers && managers.length > 0 ? managers.map(manager => ({ label: `${manager.name} ${manager.lastname_father}`, value: manager.id, photo: manager.photo })) : [],
        dependences: dependences && dependences.length > 0 ? dependences.map(dependence => ({ label: dependence.name, value: dependence.id, abbr: dependence.abbr })) : [],
    };

};