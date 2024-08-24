import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';
import { parse } from 'path';

export async function POST({ request, cookies }) {

    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if (!['super-admin', 'governor'].includes(userData.data.role)) throw redirect(301, '/');

    const data = await request.formData();

    const project = data.get('project');
    const progress = data.get('progress');
    const type = data.get('type');
    const approved = data.get('approved');
    const note = data.get('note');
    const audioFile = data.get('audio');

    let UrlPublic = '';

    if (audioFile) {
        const extension = parse(audioFile.name).ext;
        const pathname = `${crypto.randomUUID()}${extension}`;
        const mimeType = audioFile.type;

        const { error: uploadError } = await supabase.storage
            .from('records_approvals')
            .upload(pathname, audioFile, {
                contentType: mimeType
            });

        if (uploadError) {
            throw uploadError;
        }

        const publicUrl = await supabase.storage.from('records_approvals').getPublicUrl(pathname);

        UrlPublic = publicUrl.data.publicUrl;
    }

    const response = await desicionProgress(project, progress, type, approved, note, `${userData.data.name} ${userData.data.lastname_father}`, UrlPublic);
    
    await registerLogs(userData.data.id, ip, device, `Ha ${approved === 'approved' ? 'Aprobado' : 'Rechazado'} el avance de ${type} del proyecto ${project}`);

    return json({
        success: response.success
    });
}

const desicionProgress = async (project, progress, type, approved, note, admin, UrlPublic) => {
    let response = { success: true, error: null }

    try {
        let { data: projectData, error: getError } = await supabase
            .from('projects')
            .select(`id, ${type}`)
            .eq('id', project)
            .single();

        if (getError) throw getError;

        if (!projectData) throw new Error('Proyecto no encontrado');

        const updatedData = projectData[type].data.map(item => {
            if (item.id === progress) {
                return { 
                    ...item, 
                    approved: approved,
                    response: note,
                    audio: UrlPublic,
                    approved_at: new Date().toISOString(),
                    approved_by: admin
                };
            }
            return item;
        });

        const { error: updateError } = await supabase
            .from('projects')
            .update({ [type]: {data: updatedData} })
            .eq('id', project);

        if (updateError) throw updateError;

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
};

