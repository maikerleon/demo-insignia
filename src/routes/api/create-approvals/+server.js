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
    const bucket = data.get('bucket');
    let progress = JSON.parse(data.get('progress'));

    progress.id = crypto.randomUUID();

    const response = await createProgress(project, bucket, progress);
    
    await registerLogs(userData.data.id, ip, device, `Ha creado la aprobación ${progress.id} para el proyecto ${project}`);

    return json({
        success: response.success,
        newId: progress.id
    });
}

const createProgress = async (project, bucket, progress) => {
    let response = {success: true, error: null};

    try {
        const { data: currentData, error: fetchError } = await supabase
            .from('projects')
            .select(bucket)
            .eq('id', project)
            .single();

        if (fetchError) throw fetchError;

        let updatedProgressData;
        
        if (currentData && currentData[bucket] && currentData[bucket].data && Array.isArray(currentData[bucket].data)) {
            updatedProgressData = [progress, ...currentData[bucket].data];
        } else {
            updatedProgressData = [progress];
        }

        let updateObject = {};
        updateObject[bucket] = {data: updatedProgressData};

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
}