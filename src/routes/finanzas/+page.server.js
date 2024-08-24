import { redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'governor', 'chief', 'super-view'].includes(userData.data.role) ) throw redirect(301, '/');

    let { data: projects } = await supabase
        .from('projects')
        .select('id, name, dependence, manager, source, amount, status, transverse_axis, start, end, finance_note, finance_source_history')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

    let filteredProjects = [...projects];

    return {
        projects: filteredProjects
    };

};