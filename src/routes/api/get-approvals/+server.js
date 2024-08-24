import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';

export async function GET({ request, cookies }) {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if (!['super-admin', 'super-view'].includes(userData.data.role)) throw redirect(301, '/');

    const response = await searchApprovals();

    return json({
        success: response.success,
        data: response.data.pending_approvals
    });
}

const searchApprovals = async () => {
    let response = { success: true, error: null };

    try {
        const { data, error } = await supabase
            .from('pending_approvals')
            .select('*')
            .single();

            if (error) { throw error }
            response.data = data;

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
}
