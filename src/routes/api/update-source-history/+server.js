import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';
import {timesTampTz} from '$lib/utilities.js'

export async function POST({ request, cookies }) {
    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if (!['super-admin', 'governor'].includes(userData.data.role)) throw redirect(301, '/');

    const data = await request.formData();
    const project = data.get('project');
    const source = data.get('source');

    const response = await updateSourceHistory(project, source);
    
    await registerLogs(userData.data.id, ip, device, `Ha actualizado a "${source}" el recurso ejercido financiero para el proyecto ${project}`);

    return json({
        success: response.success,
        history: response.data
    });
}

const updateSourceHistory = async (project, source) => {

    let response = { success: true, error: null, data: null };

    try {
        const { data, error: fetchError } = await supabase
            .from('projects')
            .select('finance_source_history')
            .eq('id', project)
            .single();

        if (fetchError) { throw fetchError }

        let newHistory = [];

        if( data?.finance_source_history?.data ) {
            newHistory = [
                {
                    source,
                    created_at: timesTampTz()
                },
                ...data?.finance_source_history?.data
            ];
        }   else {
            newHistory = [
                {
                    source,
                    created_at: timesTampTz()
                }
            ];
        }

        const { error: updateError } = await supabase
            .from('projects')
            .update({ finance_source_history: {data: newHistory} })
            .eq('id', project);

        if (updateError) { throw updateError }

        response.data = newHistory;

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
};