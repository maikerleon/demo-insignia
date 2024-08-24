import { redirect } from '@sveltejs/kit';
import { verifySession } from '$lib/server/verify-session.server.js';
import supabase from '$lib/supabase';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    const {auth} = await verifySession(token);
    if (!auth) throw redirect(307, '/');

    let dependencesRequest = supabase
        .from('dependency_last_log')
        .select('name, abbr, id, logo, last_log_date')
        .order('order_by', { ascending: true });

    const { data: dependences } = await dependencesRequest;

    let axisRequest = supabase
        .from('axies')
        .select('name, id')
        .eq('deleted', false)

    const { data: axis } = await axisRequest;

    return {
        dependences,
        axis
    }

};