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
    let socialization = JSON.parse(data.get('socialization'));

    socialization.id = crypto.randomUUID();

    const response = await createStrategy(project, socialization);
    
    await registerLogs(userData.data.id, ip, device, `Ha creado la estrategia de socialización ${socialization.id} para el proyecto ${project}`);

    return json({
        success: response.success,
        newId: socialization.id
    });
}

const createStrategy = async (project, socialization) => {
    let response = {success: true, error: null};

    try {
        const { data: currentData, error: fetchError } = await supabase
            .from('projects')
            .select('socialization')
            .eq('id', project)
            .single();

        if (fetchError) throw fetchError;

        let updatedSocializationData;
        
        if (currentData && currentData['socialization'] && currentData['socialization'].data && Array.isArray(currentData['socialization'].data)) {
            updatedSocializationData = [socialization, ...currentData['socialization'].data];
        } else {
            updatedSocializationData = [socialization];
        }

        let updateObject = {};
        updateObject['socialization'] = {data: updatedSocializationData};

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