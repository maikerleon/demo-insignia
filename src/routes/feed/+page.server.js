import { redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'super-view', 'governor', 'chief'].includes(userData.data.role) ) throw redirect(301, '/');

    let { data: projects } = await supabase
      .from('projects')
      .select('id, name, progress_supervisor, progress')
      .eq('deleted', false);

      let progress = projects
        .filter(project => project.progress.data.length > 0)
        .map(project => {
          let latestProgress = project.progress.data.reduce((latest, current) => {
            return current.created_at > latest.created_at ? current : latest;
          }, project.progress.data[0]);
          return {
            id: project.id,
            name: project.name,
            progress: latestProgress,
          };
        });
    
    let progress_supervisor = projects
      .filter(project => project.progress_supervisor.data.length > 0)
      .map(project => {
        let latestProgressSupervisor = project.progress_supervisor.data.reduce((latest, current) => {
          return current.created_at > latest.created_at ? current : latest;
        }, project.progress_supervisor.data[0]);
        return {
          id: project.id,
          name: project.name,
          progress: latestProgressSupervisor,
        };
      });

    return {
      progress: progress.sort((a, b) => new Date(b.progress.created_at) - new Date(a.progress.created_at)),
      progress_supervisor: progress_supervisor.sort((a, b) => new Date(b.progress.created_at) - new Date(a.progress.created_at))
    };

};