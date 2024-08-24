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
    const project = data.get('project');
    const year = data.get('year');
    const month = data.get('month');

    const response = await search(project, year, month, userData.data.role, userData.data.dependence);

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

const search = async (project, year, month, role, dependence) => {
    let response = { success: true, error: null };

    try {
        let startDate = new Date(year, month - 1, 1);
        let endDate = new Date(year, month + 1, 0);

        startDate.setMonth(startDate.getMonth() - 1);
        endDate = new Date(year, month + 1, 1);
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0);

        let { data, error } = await supabase
            .from('actions')
            .select('id, name, start, end, dependence, priority, type, municipalities')
            .eq('deleted', false)
            .eq('project', project)
            .gte('start', startDate.toISOString().split('T')[0])
            .lte('end', endDate.toISOString().split('T')[0])
            .order('created_at', { ascending: false });
        
        if (error) { throw error }
        response.data = data;

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    if (role === 'dependence') {
        response.data = response.data.filter(item => item.dependence?.data?.value === dependence);
    }

    return response;
}
