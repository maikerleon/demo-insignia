import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if (!userData.auth) throw redirect(307, '/salir');
    if (!['super-admin', 'dependence', 'governor', 'chief'].includes(userData.data.role)) throw redirect(301, '/');

    const data = await request.formData();
    const project = data.get('project');
    const bucket = data.get('bucket');
    let sub_project = JSON.parse(data.get('sub_project'));
    let edit = false;

    if (sub_project.id === '') {
        sub_project.id = crypto.randomUUID();
    } else {
        edit = true;
    }

    const response = await createOrUpdateSubProject(project, bucket, sub_project, edit);

    const action = edit ? 'editado' : 'creado';
    await registerLogs(userData.data.id, ip, device, `Ha ${action} el sub proyecto ${sub_project.id} para el proyecto ${project}`);

    return json({
        success: response.success,
        newId: sub_project.id
    });
}

const createOrUpdateSubProject = async (project, bucket, sub_project, edit) => {
    let response = { success: true, error: null };

    try {
        const { data: currentData, error: fetchError } = await supabase
            .from('projects')
            .select(bucket)
            .eq('id', project)
            .single();

        if (fetchError) throw fetchError;

        let updatedProgressData;
        if (currentData && currentData[bucket] && currentData[bucket].data && Array.isArray(currentData[bucket].data)) {
            if (edit) {
                updatedProgressData = currentData[bucket].data.map(item => item.id === sub_project.id ? sub_project : item);
            } else {
                updatedProgressData = [sub_project, ...currentData[bucket].data];
            }
        } else {
            updatedProgressData = [sub_project];
        }

        let updateObject = {};
        updateObject[bucket] = { data: updatedProgressData };

        const { error: updateError } = await supabase
            .from('projects')
            .update(updateObject)
            .eq('id', project);

        if (updateError) throw updateError;

    } catch (error) {
        response.success = false;
        response.error = error.message;
    }

    return response;
};