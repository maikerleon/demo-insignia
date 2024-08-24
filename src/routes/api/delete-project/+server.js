import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const data = await request.formData();
    const project = data.get('project');

    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'dependence', 'governor', 'chief'].includes(userData.data.role) ) throw redirect(301, '/');

    const response = await deleteProject(project);
    
    await registerLogs(userData.data.id, ip, device, `Ha eliminado al proyecto ${project}`);

    return json({
        success: response.success
    });
}

const deleteProject = async (project) => {
    
    let response = {success: true, error: null}

    try {
        const { error } = await supabase
            .from('projects')
            .update({ deleted: true })
            .eq('id', project)
        
        if (error) { throw error }

        const { error: errorActions } = await supabase
            .from('actions')
            .update({ deleted: true })
            .eq('project', project)
        
        if (errorActions) { throw errorActions }

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
}