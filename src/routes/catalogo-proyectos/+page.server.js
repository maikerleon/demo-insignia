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
        .select('id, name, start, end, dependence, status, priority, transverse_axis, progress_supervisor, progress')
        .eq('deleted', false)
        .order('created_at', { ascending: false });

    const priorityMap = {
        'low': 3,
        'medium': 2,
        'high': 1
      };
    
    let filteredProjects = projects.sort((a, b) => priorityMap[a.priority] - priorityMap[b.priority]);

    return {
        projects: filteredProjects,
    };

};