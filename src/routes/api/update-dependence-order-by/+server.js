import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const data = await request.formData();
    let dependences = data.get('dependences');
    dependences = JSON.parse(dependences);

    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');

    const response = await changeOrderBy(dependences);
    
    await registerLogs(userData.data.id, ip, device, `Ha cambiado el order by de las Areas`);

    return json({
        success: response.success
    });
}

const changeOrderBy = async (dependences) => {
    let response = { success: true, error: null };

    try {
        for (const dep of dependences) {
            const { error } = await supabase
                .from('dependences')
                .update({ order_by: dep.order_by })
                .eq('id', dep.id);
            
            if (error) { 
                throw error;
            }
        }

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
}


