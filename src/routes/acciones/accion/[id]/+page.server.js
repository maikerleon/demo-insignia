import { fail, redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';
import { registerLogs } from '$lib/server/register-logs.server';
import { capitalizeString, validateString } from '$lib/utilities';
import { priorities, statutes } from '$lib/data.js';

export const load = async ({ cookies, params }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'super-view', 'supervisor', 'dependence', 'coordination', 'municipality', 'register'].includes(userData.data.role) ) throw redirect(301, '/');
    
    let { data: action } = await supabase
        .from('actions')
        .select('name, dependence, start, end, project, level, father, id, manager, people, status, priority, comments, evidence, type, municipalities, amount, beneficiaries, colonies, description')
        .eq('id', params.id)
        .eq('deleted', false)
        .limit(1);

    if (!action || action.length === 0) {
        redirect(307, '/calendarios');
    }

    let { data: project } = await supabase
        .from('projects')
        .select('name, municipalities, type, id, type')
        .eq('id', action[0].project)
        .eq('deleted', false)
        .limit(1);

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
        .order('name', { ascending: true });

    let { data: actions } = await supabase
        .from('actions')
        .select('id, name, dependence, start, end, project, type, created_at, manager, status')
        .eq('level', (action[0].level+1))
        .eq('father', action[0].id)
        .eq('deleted', false)
        .order('start', { ascending: true });

    const userHasPermissionForAction = (action, userData) => {
        if (['super-admin', 'super-view'].includes(userData.data.role)) {
            return true;
        }
        
        if (userData.data.role === 'dependence') {
            return action.dependence.data.value === userData.data.dependence;
        } else if (userData.data.role === 'coordination') {
            const actionMunicipalities = action.municipalities.data?.map(m => m.value) || [];
            return actionMunicipalities.some(municipalityId => userData.data.coordination.includes(municipalityId));
        } else if (['municipality', 'register'].includes(userData.data.role)) {
            const actionMunicipalities = action.municipalities.data?.map(m => m.value) || [];
            return actionMunicipalities.includes(userData.data.municipality);
        }
        
        return false;
    }
        
    if (!userHasPermissionForAction(action[0], userData)) {
        throw redirect(301, '/');
    }

    action[0].project_name = project[0].name;
    action[0].project_id = project[0].id;
    action[0].project_municipalities = project[0].municipalities;
    action[0].project_type = project[0].type;

    if (actions.length === 0) {
        action[0].actions = [{id: '', name: '', dependence: {data: null}, start: '', end: '', type: 'action', manager: {data: null}, status: null}];
    } else {
        action[0].actions = actions;
    }

    return {
        action: action[0],
        managers: managers && managers.length > 0 ? managers.map(manager => ({ label: `${manager.name} ${manager.lastname_father}`, value: manager.id, photo: manager.photo })) : [],
        dependences: dependences && dependences.length > 0 ? dependences.map(dependence => ({ label: dependence.name, value: dependence.id, abbr: dependence.abbr })) : [],
    }

};

export const actions = {
    action: async ({request, cookies}) => {

        const token = cookies.get('token');
        let userData = verifyToken(token);

        if ( !userData.auth ) throw redirect(307, '/salir');
        if ( !['super-admin', 'super-view', 'supervisor', 'dependence', 'coordination', 'municipality', 'register'].includes(userData.data.role) ) throw redirect(307, '/salir');
        
        const formData = await request.formData();

        let id = formData.get('id');
        let project_id = formData.get('project_id');
        let level = Number(formData.get('level'));
        let name = formData.get('name');
        let dependence = formData.get('dependence'); // JSON
        let start = formData.get('start');
        let end = formData.get('end');
        let municipalities = formData.get('municipalities'); // JSON
        let colonies = formData.get('colonies'); // JSON
        let manager = formData.get('manager'); // JSON
        let people = formData.get('people'); // JSON
        let beneficiaries = formData.get('beneficiaries');
        let amount = formData.get('amount');
        let status = formData.get('status');
        let priority = formData.get('priority');
        let description = formData.get('description');
        let comments = formData.get('comments');

        const formDataEntries = [];
        for (const [name, value] of formData.entries()) {
            formDataEntries.push({ name, value });
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

        municipalities = municipalities !== '' ? JSON.parse(municipalities) : null;
        colonies = colonies !== '' ? JSON.parse(colonies) : null;
        dependence = dependence !== '' ? JSON.parse(dependence) : null;
        manager = manager !== '' ? JSON.parse(manager) : null;
        people = people !== '' ? JSON.parse(people) : null;
        beneficiaries = !beneficiaries || beneficiaries === '' ? 0 : Number(beneficiaries);
        amount = !amount || amount === '' ? 0 : Number(amount);

        const dataReturn = { id, level, name, dependence: {data: dependence}, start, end, municipalities: {data: municipalities}, colonies: {data: colonies}, manager: {data: manager}, people: {data: people}, beneficiaries, amount, status, priority, description, comments, actions };

        try {

            for (const action of actions) {
                if (action.start !== '' && action.end !== '') {
                    if ( new Date(action.end) < new Date(action.start) ) throw new Error('una fecha de fin mayor a la de inicio para la acción "'+action.name+'"');
                }
            }

            name = capitalizeString(name);
            if ( !validateString(name,true,3,200) ) throw new Error('un nombre válido');
            if ( !validateString(start,true,10,10) ) throw new Error('una fecha de inicio válida');
            if ( !validateString(end,true,10,10) ) throw new Error('una fecha de fin válida');
            if ( !manager || manager === '' ) throw new Error('un responsable válido');
            if ( !people || people === '' ) throw new Error('una persona asignada válida');
            if ( statutes.findIndex(it => it.value === status) === -1 ) throw new Error('un estatus válido');
            if ( priorities.findIndex(it => it.value === priority) === -1 ) throw new Error('una prioridad válida');

            const create = !id ? true : false;

            const uniqueID = crypto.randomUUID();

            let response;

            response = await editAction({id, level, name, dependence: {data: dependence}, start, end, municipalities: {data: municipalities}, colonies: {data: colonies}, manager: {data: manager}, people: {data: people}, beneficiaries, amount, status, priority, description, comments}, actions, userData.data.id, project_id);

            if (!response.success) {
                throw new Error(response.message);
            }

            const device = await request.headers.get('user-agent');
            const ip = await request.headers.get('x-forwarded-for') || 'localhost';
            
            await registerLogs(userData.data.id, ip, device, `Ha ${create ? 'creado' : 'editado'} la acción de nivel ${level} de id ${uniqueID}`);

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

const editAction = async (data, actions_temp, user, project_id) => {

    const { error } = await supabase
        .from('actions')
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
                project: project_id,
                level: (data.level+1),
                created_by: data.created_by,
                father: data.id,
                type: act.type,
                created_by: user
            });
        }
    }

    if ( new_actions.length > 0 ) {
        const { error: errorNewActions } = await supabase
            .from('actions')
            .insert(new_actions);

        if (errorNewActions) return { success: false, message: errorNewActions.message };
    }

    for (const action of actions_temp) {
        if ( action.id !== '') {

            action.start = action.start === "" ? null : action.start;
            action.end = action.end === "" ? null : action.end;

            const { error: errorEditActions } = await supabase
                .from('actions')
                .update(action)
                .eq('id', action.id);

            if (errorEditActions) return { success: false, message: errorEditActions.message };
        }
    }

    return { success: true };
}