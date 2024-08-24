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
    if (!['super-admin', 'governor', 'chief'].includes(userData.data.role)) throw redirect(301, '/');

    const data = await request.formData();
    const project = data.get('project');
    const note = data.get('note');

    const response = await saveNote(project, note);
    
    await registerLogs(userData.data.id, ip, device, `Ha actualizado a "${note}" la nota de reunión para el proyecto ${project}`);

    return json({
        success: response.success
    });
}

const saveNote = async (project, note) => {

    let response = {success: true, error: null}

    try {
        const { error } = await supabase
            .from('projects')
            .update({ note_meet: note })
            .eq('id', project)
        
        if (error) { throw error }

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
}