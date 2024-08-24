import { fail, redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';
import { registerLogs } from '$lib/server/register-logs.server';
import { capitalizeString, validateString, isValidJSON } from '$lib/utilities';
import { priorities, statutes, statusByOrder } from '$lib/data.js';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'governor', 'chief', 'super-view', 'supervisor', 'dependence'].includes(userData.data.role) ) throw redirect(301, '/');

    let { data: projects } = await supabase
        .from('projects')
        .select('id, name, commitment, start, end, axis, theme, regions, municipalities, dependence, manager, source, amount, status, priority, objectives, transverse_axis, background, aditional_information, description, strategic_project, strategy, beneficiaries, address, have_address, indicators, impact, check_list, progress, progress_supervisor, end_project, approvals, note, planning, socialization, sub_projects, secretaries, supervision, executive_plan, vobo, right_way, political_consideration, finance_source_history')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

    let { data: dependences } = await supabase
        .from('dependences')
        .select('id, name, abbr, logo')
        .eq('deleted', false)
        .order('name', { ascending: true });

    let { data: axies } = await supabase
        .from('axies')
        .select('id, name')
        .eq('deleted', false)
        .order('name', { ascending: true });

    let { data: managers } = await supabase
        .from('admins')
        .select('id, name, lastname_father, photo')
        .eq('role', 'dependence')
        .eq('deleted', false)
        .order('name', { ascending: true });

    let { data: subactions } = await supabase
        .from('actions')
        .select('level, project')
        .eq('level', 2)
        .eq('deleted', false);

    let { data: actions } = await supabase
        .from('actions')
        .select('id, name, dependence, start, end, project, type, created_at, municipalities, description, amount, beneficiaries, manager, status')
        .eq('level', 1)
        .eq('deleted', false)
        .order('start', { ascending: true });

    projects.forEach(project => {
        const projectActions = actions.filter(action => action.project === project.id);
        const projectSubactions = subactions.filter(subaction => subaction.project === project.id);
        project.actions = { list: projectActions };
        project.subactions = projectSubactions && projectSubactions.length > 0 ? true : false;
    });

    let filteredProjects = [...projects];

    if ( userData.data.role === 'dependence' ) {
        filteredProjects = projects.filter(project => {
            const hasMatchingProjectDependence = project.dependence?.data?.value === userData.data.dependence;
            const hasMatchingActionDependence = project.actions.list.some(action => action.dependence?.data?.value === userData.data.dependence);
            return hasMatchingProjectDependence || hasMatchingActionDependence;
        });
    }

    if ( userData.data.role === 'dependence' ) {
        filteredProjects.sort((a, b) => {
            const indexA = statusByOrder.indexOf(a.status);
            const indexB = statusByOrder.indexOf(b.status);
          
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
          
            return indexA - indexB;
        });
    }

    return {
        projects: filteredProjects,
        managers: managers && managers.length > 0 ? managers.map(manager => ({ label: `${manager.name} ${manager.lastname_father}`, value: manager.id, photo: manager.photo })) : [],
        dependences: dependences && dependences.length > 0 ? dependences.map(dependence => ({ label: dependence.name, value: dependence.id, abbr: dependence.abbr, logo: dependence.logo })) : [],
        axies: axies && axies.length > 0 ? axies.map(axis => ({ label: axis.name, value: axis.id })) : []
    };

};

export const actions = {
    project: async ({request, cookies}) => {
        const token = cookies.get('token');
        let userData = verifyToken(token);

        if ( !userData.auth ) throw redirect(307, '/salir');
        if ( !['super-admin', 'governor', 'chief', 'super-view', 'supervisor', 'dependence'].includes(userData.data.role) ) throw redirect(301, '/');
        
        const formData = await request.formData();

        let id = formData.get('id');
        let name = formData.get('name');
        let commitment = formData.get('commitment');
        let secretaries = formData.get('secretaries');
        let start = formData.get('start');
        let end = formData.get('end');
        let axis = formData.get('axis');
        let theme = formData.get('theme');
        // let type = formData.get('type');
        let regions = formData.get('regions');
        let municipalities = formData.get('municipalities');
        let dependence = formData.get('dependence');
        let manager = formData.get('manager');
        let amount = formData.get('amount');
        let status = formData.get('status');
        let priority = formData.get('priority');
        let impact = formData.get('impact');
        let planning = formData.get('planning');

        let executive_plan = formData.get('executive_plan');
        let vobo = formData.get('vobo');
        let right_way = formData.get('right_way');
        let political_consideration = formData.get('political_consideration');

        let have_address = formData.get('have_address');
        let address = formData.get('address');

        let transverse_axis = formData.get('transverse_axis');
        let background = formData.get('background');
        let aditional_information = formData.get('aditional_information');

        let description = formData.get('description');
        let strategy = formData.get('strategy');
        let strategic_project = formData.get('strategic_project');
        let supervision = formData.get('supervision');

        // End Project
        let date_closed = formData.get('date_closed');
        let type_closed = formData.get('type_closed');
        let total_closed = formData.get('total_closed');
        let description_closed = formData.get('description_closed');
        let address_closed = formData.get('address_closed');
        let coordinates_closed = formData.get('coordinates_closed');
        let evidence_json = JSON.parse(formData.get('evidence_json'));

        const formDataEntries = [];
        for (const [name, value] of formData.entries()) {
            formDataEntries.push({ name, value });
        }

        let objectives = [];

        for (const [name, value] of formData.entries()) {
            if (name === 'objectives' && value !== '' && value) objectives.push({objective: value});
        }

        const groupActions = (entries) => {
            const actions = {};
          
            entries.forEach(({ name, value }) => {
              const match = name.match(/(.+_action)_(\d+)$/);
              if (match) {
                const [, key, groupId] = match;
                if (!actions[groupId]) {
                  actions[groupId] = {};
                }
                actions[groupId][key.replace(/_\d+$/, '')] = value;
              }
            });

            return Object.values(actions).map(action => {
                const dep = action.dependence_action !== '' ? JSON.parse(action.dependence_action) : null;
                const mang = action.manager_action !== '' ? JSON.parse(action.manager_action) : null;
                return {
                    id: action.id_action,
                    name: action.name_action,
                    dependence: {data: dep},
                    start: action.start_action,
                    end: action.end_action,
                    type: action.type_action,
                    manager: {data: mang},
                    status: action.status_action
                };
            });
        };
          
        const actions = groupActions(formDataEntries);

        const groupSource = (entries) => {
            const source = {};
          
            entries.forEach(({ name, value }) => {
              const match = name.match(/(.+_source)_(\d+)$/);
              if (match) {
                const [, key, groupId] = match;
                if (!source[groupId]) {
                  source[groupId] = {};
                }
                source[groupId][key.replace(/_\d+$/, '')] = value;
              }
            });

            return Object.values(source).map(source => {
                return {
                    source: source.source_source,
                    type: source.type_source,
                    amount: source.amount_source,
                    beneficiaries: source.beneficiaries_source
                };
            });
        };
          
        const source = groupSource(formDataEntries);

        const groupIndicators = (entries) => {
            const indicators = {};
          
            entries.forEach(({ name, value }) => {
              const match = name.match(/(.+_indicator)_(\d+)$/);
              if (match) {
                const [, key, groupId] = match;
                if (!indicators[groupId]) {
                  indicators[groupId] = {};
                }
                indicators[groupId][key.replace(/_\d+$/, '')] = value;
              }
            });

            return Object.values(indicators).map(indicator => {
                return {
                    name: indicator.name_indicator,
                    type_value: indicator.type_value_indicator,
                    value: indicator.value_indicator,
                    position: indicator.position_indicator,
                    source: indicator.source_indicator,
                    value_closed: indicator.value_closed_indicator
                };
            });
        };
          
        const indicators = groupIndicators(formDataEntries);

        const groupBeneficiaries = (entries) => {
            const benefGeneral = {};
          
            entries.forEach(({ name, value }) => {
              const match = name.match(/(.+_beneficiaries_general)_(\d+)$/);
              if (match) {
                const [, key, groupId] = match;
                if (!benefGeneral[groupId]) {
                  benefGeneral[groupId] = {};
                }
                benefGeneral[groupId][key.replace(/_\d+$/, '')] = value;
              }
            });

            return Object.values(benefGeneral).map(bene => {
                return {
                    amount: Number(bene.amount_beneficiaries_general),
                    group: !isValidJSON(bene.group_beneficiaries_general) ? null : JSON.parse(bene.group_beneficiaries_general),
                    group_age: !isValidJSON(bene.group_age_beneficiaries_general) ? null : JSON.parse(bene.group_age_beneficiaries_general)
                };
            });
        };
          
        const beneficiaries = groupBeneficiaries(formDataEntries);
        
        const groupBeneficiariesClosed = (entries) => {
            const benef = {};
          
            entries.forEach(({ name, value }) => {
              const match = name.match(/(.+_beneficiaries)_(\d+)$/);
              if (match) {
                const [, key, groupId] = match;
                if (!benef[groupId]) {
                  benef[groupId] = {};
                }
                benef[groupId][key.replace(/_\d+$/, '')] = value;
              }
            });

            return Object.values(benef).map(ben => {
                return {
                    amount: ben.amount_beneficiaries,
                    group: ben.group_beneficiaries === '' ? null : JSON.parse(ben.group_beneficiaries),
                };
            });
        };
          
        const beneficiaries_closed = groupBeneficiariesClosed(formDataEntries);

        const end_project = {
            date: date_closed, 
            type: type_closed, 
            total_amount: total_closed, 
            description: description_closed,
            beneficiaries: beneficiaries_closed,
            location: {
                address: address_closed, 
                coordinates: coordinates_closed
            },
            created_at: new Date().toISOString(),
            evidence: evidence_json
        }

        commitment = commitment !== '' ? JSON.parse(commitment) : null;
        axis = axis !== '' ? JSON.parse(axis) : null;
        theme = theme !== '' ? JSON.parse(theme) : null;
        regions = regions !== '' ? JSON.parse(regions) : null;
        secretaries = secretaries !== '' ? JSON.parse(secretaries) : null;
        municipalities = municipalities !== '' ? JSON.parse(municipalities) : null;
        dependence = dependence !== '' ? JSON.parse(dependence) : null;
        manager = manager !== '' ? JSON.parse(manager) : null;
        transverse_axis = transverse_axis !== '' ? JSON.parse(transverse_axis) : null;
        
        const dataReturn = {id, name, commitment: {data: commitment}, start, end, axis: {data: axis}, theme: {data: theme}, regions: {data: regions}, municipalities: {data: municipalities}, dependence: {data: dependence}, manager: {data: manager}, indicators: {list: indicators}, source: {list: source}, amount, status, priority, objectives: {list: objectives}, actions: {list: actions}, transverse_axis: {data: transverse_axis}, background, aditional_information, description, strategic_project, supervision, strategy, beneficiaries: {list: beneficiaries}, address, have_address, impact, end_project, planning, secretaries: {data: secretaries}, executive_plan, vobo, right_way, political_consideration};

        try {

            for (const action of actions) {
                if (action.start !== '' && action.end !== '') {
                    if ( new Date(action.end) < new Date(action.start) ) throw new Error('una fecha de fin mayor a la de inicio para la acción "'+action.name+'"');
                }
            }

            name = capitalizeString(name);
            if ( name.length < 3 ) throw new Error('un nombre válido');
            if ( !commitment || commitment === '' ) throw new Error('un compromiso válido');
            if ( !validateString(start,true,10,10) ) throw new Error('una fecha de inicio válida');
            if ( !validateString(end,true,10,10) ) throw new Error('una fecha de fin válida');
            if ( !axis || axis === '' ) throw new Error('un eje válido');
            // if ( types.findIndex(it => it.value === type) === -1 ) throw new Error('Tipo de proyecto no válido');
            if ( !strategy || strategy === '' ) throw new Error('una estrategia válida');
            if ( !regions || regions === '' ) throw new Error('una región válida');
            if ( !municipalities || municipalities === '' ) throw new Error('un municipio válido');
            if ( !dependence || dependence === '' ) throw new Error('una dependencia válida');
            if ( !manager || manager === '' ) throw new Error('un responsable válido');
            if ( source.length === 0 ) throw new Error('al menos una fuente del recurso válida');
            if ( indicators.length === 0 ) throw new Error('al menos un indicador de impacto válido');
            if ( statutes.findIndex(it => it.value === status) === -1 ) throw new Error('un estatus válido');
            if ( priorities.findIndex(it => it.value === priority) === -1 ) throw new Error('una prioridad válida');
            if ( description === '' ) throw new Error('una descripción válida');
            if ( objectives.length === 0 ) throw new Error('al menos un objetivo');

            const create = !id ? true : false;

            const uniqueID = crypto.randomUUID();

            let response;

            if (create) {
                response = await registerProject({id:uniqueID, name, commitment: {data: commitment}, start, end, axis: {data: axis}, theme: {data: theme}, regions: {data: regions}, municipalities: {data: municipalities}, dependence: {data: dependence}, manager: {data: manager}, indicators: {list: indicators}, source: {list: source}, amount, status, priority, objectives: {list: objectives}, transverse_axis: {data: transverse_axis}, background, aditional_information, description, strategy, strategic_project, supervision, beneficiaries: {list: beneficiaries}, created_by: userData.data.id, address, have_address, impact, end_project, planning, secretaries: {data: secretaries}, executive_plan, vobo, right_way, political_consideration}, actions);
            } else {
                response = await editProject({id, name, commitment: {data: commitment}, start, end, axis: {data: axis}, theme: {data: theme}, regions: {data: regions}, municipalities: {data: municipalities}, dependence: {data: dependence}, manager: {data: manager}, indicators: {list: indicators}, source: {list: source}, amount, status, priority, objectives: {list: objectives}, transverse_axis: {data: transverse_axis}, background, aditional_information, description, strategy, strategic_project, supervision, beneficiaries: {list: beneficiaries}, address, have_address, impact, end_project, planning, secretaries: {data: secretaries}, executive_plan, vobo, right_way, political_consideration}, actions, userData.data.id);
            }

            if (!response.success) {
                throw new Error(response.message);
            }

            const device = await request.headers.get('user-agent');
            const ip = await request.headers.get('x-forwarded-for') || 'localhost';
            
            await registerLogs(userData.data.id, ip, device, `Ha ${create ? 'creado' : 'editado'} las acciones nivel 1 del proyecto ${uniqueID}`);
            await registerLogs(userData.data.id, ip, device, `Ha ${create ? 'creado' : 'editado'} el proyecto ${uniqueID}`);

            if (create) {
                dataReturn.id = uniqueID;
            }

            return fail(400, {
                success: true,
                create,
                data: {...dataReturn}
            })

        } catch ({message}) {
            const template = message === 'inesperado' ? 'Ha ocurrido un error inesperado, intente nuevamente.' : `Por favor ingrese ${message}.`;
            return fail(400, {
                error: true,
                message: template,
                data: {...dataReturn}
            })
        }
        
    }
}

const registerProject = async (data, actions_temp) => {

    const { error } = await supabase
        .from('projects')
        .insert([data]);

    if (error) {
        return { success: false, message: error.message };
    }


    const actions = actions_temp.map(action => {

        return {
            name: action.name,
            dependence: action.dependence,
            start: action.start === '' ? null : action.start,
            end: action.end === '' ? null : action.end,
            project: data.id,
            level: 1,
            created_by: data.created_by,
            father: data.id,
            type: action.type,
            manager: action.manager,
            status: action.status,
            created_by: data.created_by
        }
    });

    const { error: errorActions } = await supabase
        .from('actions')
        .insert(actions);

    if (errorActions) {
        return { success: false, message: error.message };
    }

    return { success: true };
}

const editProject = async (data, actions_temp, user) => {

    const { error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', data.id);

    if (error) {
        return { success: false, message: error.message };
    }

    let new_actions = [];

    for (const act of actions_temp) {

        if ( act.id === '') {
            new_actions.push({
                name: act.name,
                dependence: act.dependence,
                manager: act.manager,
                status: act.status,
                start: act.start === '' ? null : act.start,
                end: act.end === '' ? null : act.end,
                start: act.start,
                end: act.end,
                project: data.id,
                level: 1,
                created_by: user,
                father: data.id,
                type: act.type
            });
        }
    }

    if ( new_actions.length > 0 ) {
        const { error: errorNewActions } = await supabase
            .from('actions')
            .insert(new_actions);

        if (errorNewActions) return { success: false, message: error.message };
    }

    for (const action of actions_temp) {
        if ( action.id !== '') {

            action.start = action.start === "" ? null : action.start;
            action.end = action.end === "" ? null : action.end;

            const { error: errorEditActions } = await supabase
                .from('actions')
                .update(action)
                .eq('id', action.id);

            if (errorEditActions) return { success: false, message: error.message };
        }
    }

    return { success: true };
}