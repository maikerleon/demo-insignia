import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if (!['super-admin', 'governor'].includes(userData.data.role)) throw redirect(301, '/');

    const data = await request.formData();
    const project = data.get('project');
    const field = data.get('field');
    const value = data.get('value');

    const response = await updateConstructions(project, field, value);
    
    await registerLogs(userData.data.id, ip, device, `Ha actualizado a "${value}" el ${field} del proyecto ${project}`);

    return json({
        success: response.success
    });
}

const updateConstructions = async (project, field, value) => {
    
    let response = {success: true, error: null}

    try {
        const updateData = { [field]: value };
        const { error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', project)
        
        if (error) { throw error }

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
}

