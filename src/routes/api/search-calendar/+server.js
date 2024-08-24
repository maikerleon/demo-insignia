import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';
import { priorities } from '$lib/data.js';

export async function POST({ request, cookies }) {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'governor', 'chief', 'super-view', 'supervisor', 'dependence'].includes(userData.data.role) ) throw redirect(301, '/');

    const data = await request.formData();
    const type = data.get('type');
    const year = data.get('year');
    const month = data.get('month');

    const response = await search(type, year, month, userData.data.role, userData.data.dependence);

    const prioritiesMap = priorities.reduce((map, priority) => {
        map[priority.value] = { color_hex: priority.color_hex, text_color: priority.text_color };
        return map;
    }, {});

    return json({
        success: response.success,
        data: response.data.map(item => {
            const priority = prioritiesMap[item.priority];
            return {
                ...item,
                title: item.name,
                color: priority ? priority.color_hex : null,
                textColor: priority ? priority.text_color : null 
            };
        })
    });
}

const search = async (type, year, month, role, dependence) => {
    let response = { success: true, error: null };

    try {
        let startDate = new Date(year, month - 1, 1);
        let endDate = new Date(year, month + 1, 0);

        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date(year, month + 1, 1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);

        if ( type === 'projects') {
            let { data, error } = await supabase
                .from(type)
                .select('id, name, start, end, dependence, priority, progress, progress_supervisor, municipalities, description')
                .eq('deleted', false)
                .gte('start', startDate.toISOString().split('T')[0])
                .lte('end', endDate.toISOString().split('T')[0])
                .order('created_at', { ascending: false });

            if (error) { throw error }
            response.data = data;

        } else {
            let { data, error } = await supabase
                .from(type)
                .select('id, name, start, end, dependence, priority, type, project, municipalities')
                .eq('deleted', false)
                .gte('start', startDate.toISOString().split('T')[0])
                .lte('end', endDate.toISOString().split('T')[0])
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            const projectIds = data.map(action => action.project);
            const { data: projectsData, error: projectsError } = await supabase
            .from('projects')
            .select('id, name')
            .in('id', projectIds);

            if (projectsError) {
                throw projectsError;
            }

            data.forEach(action => {
                const associatedProject = projectsData.find(project => project.id === action.project);
                if (associatedProject) {
                    action.project_name = associatedProject.name;
                }
            });

            response.data = data;
            
        }

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    if (role === 'dependence') {
        response.data = response.data.filter(item => item.dependence?.data?.value === dependence);
    }

    return response;
}
