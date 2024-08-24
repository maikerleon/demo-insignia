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
    if ( !['super-admin', 'dependence', 'governor', 'chief'].includes(userData.data.role) ) throw redirect(301, '/');

    const data = await request.formData();
    const project = data.get('project');
    const evidence = JSON.parse(data.get('evidence'));

    const response = await updateEvidenceEndProject(project, evidence);
    
    await registerLogs(userData.data.id, ip, device, `Ha actualizado evidencia del cierre del proyecto ${project}`);

    return json({
        success: response.success
    });
}

const updateEvidenceEndProject = async (project, evidence) => {

    let response = {success: true, error: null};

    try {
        let { data: currentData, error: fetchError } = await supabase
            .from('projects')
            .select('end_project')
            .eq('id', project)
            .single();

        if (fetchError) throw fetchError;

        currentData.end_project.evidence = evidence;

        const { error: updateError } = await supabase
            .from('projects')
            .update({ end_project: currentData.end_project})
            .eq('id', project);

        if (updateError) throw updateError;

    } catch (error) {
        response.success = false;
        response.error = error.message;
    }

    return response;
}

