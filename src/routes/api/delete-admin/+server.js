import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const data = await request.formData();
    const admin = data.get('admin');

    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if (['register'].includes(userData.data.role)) throw redirect(301, '/');

    const response = await deleteAdmin(admin);
    
    await registerLogs(userData.data.id, ip, device, `Ha eliminado al administrador ${admin}`);

    return json({
        success: response.success
    });
}

const deleteAdmin = async (admin) => {
    
    let response = {success: true, error: null}

    try {
        const { error } = await supabase
            .from('admins')
            .update({ deleted: true })
            .eq('id', admin)
        
        if (error) { throw error }

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
}

