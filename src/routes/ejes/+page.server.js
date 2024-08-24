import { fail, redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';
import { registerLogs } from '$lib/server/register-logs.server';
import { capitalizeString, uppercaseString, validateString, validatePhoneNumber } from '$lib/utilities';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'super-view'].includes(userData.data.role) ) throw redirect(301, '/');
    
    let axiesRequest = supabase
        .from('axies')
        .select('name, objective, strategy, actions, id')
        .order('name', { ascending: true })
        .eq('deleted', false);

    const { data: axies } = await axiesRequest;

    return {
        axies
    }

};

export const actions = {
    axis: async ({request, cookies}) => {
        const token = cookies.get('token');
        let userData = verifyToken(token);

        if ( !userData.auth ) throw redirect(307, '/salir');
        if ( !['super-admin'].includes(userData.data.role) ) throw redirect(307, '/salir');
        
        const formData = await request.formData();
        let id = formData.get('id');
        let name = formData.get('name');
        let objective = formData.get('objective');
        let strategy = formData.get('strategy');

        const formDataEntries = formData.entries();
        let actions = [];

        for (const [name, value] of formDataEntries) {
            if (name === 'actions' && value !== '' && value) actions.push({action: value});
        }

        if (actions.length === 0) {
            actions = [{action: ''}];
        }

        name = capitalizeString(name);
        
        const dataReturn = {id, name, objective, strategy, actions: { list: actions }};
        
        try {
            if ( !validateString(name,false,3,50) ) throw new Error('un nombre válido');

            const create = !id ? true : false;

            const uniqueID = crypto.randomUUID();

            let response;

            if (create) {
                response = await registerAxis({id:uniqueID, name, objective, strategy, actions: { list: actions }, created_by: userData.data.id});
            } else {
                response = await editAxis({id, name, objective, strategy, actions: { list: actions }});
            }

            if (!response.success) {
                throw new Error('inesperado');
            }

            const device = await request.headers.get('user-agent');
            const ip = await request.headers.get('x-forwarded-for') || 'localhost';
            
            await registerLogs(userData.data.id, ip, device, `Ha ${create ? 'creado' : 'editado'} el eje ${uniqueID}`);

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

const registerAxis = async (data) => {

    const { error } = await supabase
    .from('axies')
    .insert([data]);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
}

const editAxis = async (data) => {

    const { error } = await supabase
    .from('axies')
    .update(data)
    .eq('id', data.id);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
}