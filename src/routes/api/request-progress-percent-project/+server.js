import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';
import { priorities } from '$lib/data.js';

export async function POST({ request, cookies }) {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'governor', 'chief', 'super-view', 'supervisor', 'dependence'].includes(userData.data.role) ) throw redirect(301, '/');

    const data = await request.formData();
    const project = data.get('project');

    const response = await requesting(project);

    return json({
        success: response.success,
        data: response.data
    });
}

const requesting = async (project) => {
    let response = { success: true, error: null };

    try {
        let { data, error } = await supabase
            .from('actions')
            .select('status')
            .eq('level', 1)
            .eq('deleted', false)
            .eq('project', project)
            .order('created_at', { ascending: false });

        if (error) { throw error }
        
        let totalCount = data.length;
        let finishedCount = data.filter(action => action.status === 'finished').length;
        let percentage = (finishedCount / totalCount) * 100;

        response.data = percentage;

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
}