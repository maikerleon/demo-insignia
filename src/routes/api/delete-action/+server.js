import { verifyToken } from '$lib/server/auth.server.js';
import { registerLogs } from '$lib/server/register-logs.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const data = await request.formData();
    const action = data.get('action');

    const device = await request.headers.get('user-agent');
    const ip = await request.headers.get('x-forwarded-for') || 'localhost';
    
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'dependence', 'governor', 'chief'].includes(userData.data.role) ) throw redirect(301, '/');

    const response = await deleteAction(action);
    
    await registerLogs(userData.data.id, ip, device, `Ha eliminado a la acción ${action}`);

    return json({
        success: response.success
    });
}

const deleteAction = async (actionId) => {
    let response = { success: true, error: null };

    const deleteActionAndChildren = async (id) => {
        try {
            const { error: deleteError } = await supabase
                .from('actions')
                .update({ deleted: true })
                .eq('id', id);

            if (deleteError) throw deleteError;

            const { data: childActions, error: childActionsError } = await supabase
                .from('actions')
                .select('id')
                .eq('father', id);

            if (childActionsError) throw childActionsError;

            if (childActions.length > 0) {
                await Promise.all(childActions.map(action => deleteActionAndChildren(action.id)));
            }
        } catch (error) {
            throw error;
        }
    };

    try {
        await deleteActionAndChildren(actionId);
    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
};
