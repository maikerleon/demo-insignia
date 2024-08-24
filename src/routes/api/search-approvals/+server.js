import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if (!['super-admin', 'super-view', 'governor', 'chief'].includes(userData.data.role)) throw redirect(301, '/');

    const data = await request.formData();
    const type = data.get('type');

    const response = await search(type);

    return json({
        success: true,
        data: response.data
    });
}

const search = async (type) => {
    let response = { success: true, error: null };

    try {
        let { data, error } = await supabase
            .from('projects')
            .select('id, progress, progress_supervisor, approvals, name')
            .eq('deleted', false);

        if (error) { throw error; }

        let newArray = [];

        data.forEach(item => {
            item.progress.data.forEach(progress => {
                if (progress.need_approve && progress.approved === type) {
                newArray.push({
                    project_name: item.name,
                    general: progress.approval_details,
                    response: progress.response,
                    approved: progress.approved,
                    approved_at: progress.approved_at,
                    approved_by: progress.approved_by,
                    files_approved: progress.files_approved,
                    created_at: progress.created_at,
                    project_id: item.id,
                    progress_id: progress.id,
                    audio: progress?.audio ?? '',
                    type: 'progress'
                });
                }
            });

            item.progress_supervisor.data.forEach(progress_supervisor => {
                if (progress_supervisor.need_approve && progress_supervisor.approved === type) {
                newArray.push({
                    project_name: item.name,
                    general: progress_supervisor.approval_details,
                    response: progress_supervisor.response,
                    approved: progress_supervisor.approved,
                    approved_at: progress_supervisor.approved_at,
                    approved_by: progress_supervisor.approved_by,
                    files_approved: progress_supervisor.files_approved,
                    created_at: progress_supervisor.created_at,
                    project_id: item.id,
                    progress_id: progress_supervisor.id,
                    audio: progress_supervisor?.audio ?? '',
                    type: 'progress_supervisor'
                });
                }
            });

            item.approvals.data.forEach(approvals => {
                if (approvals.need_approve && approvals.approved === type) {
                newArray.push({
                    project_name: item.name,
                    general: approvals.approval_details,
                    response: approvals.response,
                    approved: approvals.approved,
                    approved_at: approvals.approved_at,
                    approved_by: approvals.approved_by,
                    files_approved: approvals.files_approved,
                    created_at: approvals.created_at,
                    project_id: item.id,
                    progress_id: approvals.id,
                    audio: approvals?.audio ?? '',
                    type: 'approvals'
                });
                }
            });
            
        });

        response.data = newArray;

    } catch (error) {
        response.success = false;
        response.error = error.message;
    }

    return response;
}