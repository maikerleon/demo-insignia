import { fail, redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';
import { registerLogs } from '$lib/server/register-logs.server';
import { capitalizeString, uppercaseString, validateString, validatePhoneNumber } from '$lib/utilities';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin','super-view'].includes(userData.data.role)) throw redirect(301, '/');
    
    let dependencesRequest = supabase
        .from('dependences')
        .select('name, address, phone, abbr, id, logo, order_by')
        .order('order_by', { ascending: true })
        .eq('deleted', false);

    const { data: dependences } = await dependencesRequest;

    return {
        dependences
    }

};

export const actions = {
    dependence: async ({request, cookies}) => {
        const token = cookies.get('token');
        let userData = verifyToken(token);

        if ( !userData.auth ) throw redirect(307, '/salir');
        if ( !['super-admin'].includes(userData.data.role) ) throw redirect(307, '/salir');
        
        const formData = await request.formData();
        let id = formData.get('id');
        let name = formData.get('name');
        let phone = formData.get('phone');
        let abbr = formData.get('abbr');
        let street = formData.get('street');
        let number = formData.get('number');
        let cp = formData.get('cp');
        let municipality = formData.get('municipality');
        let coordinates = formData.get('coordinates');

        name = capitalizeString(name);
        abbr = uppercaseString(abbr);
        municipality = Number(municipality);
        
        const dataReturn = {id, name, phone, abbr, address: {street, number, cp, municipality, coordinates}};
        
        
        try {
            if ( name.length < 2 ) throw new Error('un nombre válido');
            if ( phone !== '' && !validatePhoneNumber(phone) ) throw new Error('un teléfono válido');
            if ( abbr !== '' && abbr.length < 3 && abbr.length > 6 ) throw new Error('una abreviación válida');
            if ( street !== '' && !validateString(street,true,3,60) ) throw new Error('una dirección válida');
            if ( cp !== '' && !validateString(cp,true,5,5) ) throw new Error('un código postal válido');
            if ( municipality !== '' && municipality !== 0 ) {
                 if (municipality < 1 || municipality > 38) {
                     throw new Error('un municipio válido');
                 }
            }
            if ( coordinates !== '' && coordinates.length < 4 ) throw new Error('unas coordenadas válidas');

            const create = !id ? true : false;

            const uniqueID = crypto.randomUUID();

            let response;

            if (create) {
                response = await registerDependence({id:uniqueID, name, phone, abbr, address: {street, number, cp, municipality, coordinates}, created_by: userData.data.id });
            } else {
                response = await editDependence({id, name, phone, abbr, address: {street, number, cp, municipality, coordinates} });
            }

            if (!response.success) {
                throw new Error('inesperado');
            }

            const device = await request.headers.get('user-agent');
            const ip = await request.headers.get('x-forwarded-for') || 'localhost';
            
            await registerLogs(userData.data.id, ip, device, `Ha ${create ? 'creado' : 'editado'} la dependencia ${uniqueID}`);

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

const registerDependence = async (data) => {

    const { error } = await supabase
    .from('dependences')
    .insert([data]);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
}

const editDependence = async (data) => {

    const { error } = await supabase
    .from('dependences')
    .update(data)
    .eq('id', data.id);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
}