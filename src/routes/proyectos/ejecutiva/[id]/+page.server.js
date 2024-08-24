import { redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';

export const load = async ({ cookies, params }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'governor', 'chief', 'super-view'].includes(userData.data.role) ) throw redirect(301, '/');
    
    let { data: project } = await supabase
        .from('projects')
        .select('id, name, commitment, start, end, axis, municipalities, dependence, manager, amount, status, description, beneficiaries, indicators, progress, progress_supervisor, strategy, theme, check_list, socialization, planning, finance_source_history, secretaries, note_meet, sub_projects, end_project, source')
        .eq('deleted', false)
        .eq('id', params.id)
        .order('created_at', { ascending: false });
    
    if ( !project || project.length === 0) throw redirect(301, '/proyectos');

    let { data: actions } = await supabase
        .from('actions')
        .select('id, name, start, end, status, dependence')
        .eq('level', 1)
        .eq('project', params.id)
        .eq('deleted', false)
        .order('start', { ascending: true });

    project[0].actions = { list: actions };

    return {
        project: project[0]
    };

};