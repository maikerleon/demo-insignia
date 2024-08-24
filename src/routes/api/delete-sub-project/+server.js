import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const data = await request.formData();
    const project = data.get('project');
    const sub_project = data.get('sub_project');

    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');

    const response = await deleteSubProject(project, sub_project);
    
    await registerLogs(userData.data.id, ip, device, `Ha eliminado el sub proyecto ${sub_project} del proyecto ${project}`);

    return json({
        success: response.success
    });
}

const deleteSubProject = async (project, sub_project) => {
    let response = { success: true, error: null };

    try {
        const { data, error: fetchError } = await supabase
            .from('projects')
            .select('sub_projects')
            .eq('id', project)
            .single();

        if (fetchError) { throw fetchError }

        let subProjects = data.sub_projects.data;

        const subProjectIndex = subProjects.findIndex(sub => sub.id === sub_project);

        if (subProjectIndex === -1) {
            throw new Error('Subproyecto no encontrado');
        }

        subProjects.splice(subProjectIndex, 1);

        const { error: updateError } = await supabase
            .from('projects')
            .update({ sub_projects: { data: subProjects } })
            .eq('id', project);

        if (updateError) { throw updateError }

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
}
