import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';
import moment from 'moment-timezone';

export async function POST({ request, cookies }) {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if (!['super-admin', 'governor', 'chief', 'super-view'].includes(userData.data.role)) throw redirect(301, '/');

    const data = await request.formData();
    const time = data.get('time');

    const responseActions = await search(time, 'actions');
    const responseProjects = await search(time, 'projects');

    responseProjects.data.forEach(project => project.type = 'project');
    
    const allData = [...responseActions.data, ...responseProjects.data];
    allData.sort((a, b) => new Date(a.end) - new Date(b.end));

    return json({
        success: true,
        data: allData
    });
}

const search = async (time, type) => {
    let response = { success: true, error: null };

    try {
        let today = moment.tz("America/Mexico_City").startOf('day');
        let endDate = today.clone().add(time, 'days');

        let { data, error } = await supabase
            .from(type)
            .select('id, manager, dependence, name, status, start, end' + (type === 'actions' ? ', type' : ''))
            .eq('deleted', false)
            .gte('end', today.format('YYYY-MM-DD'))
            .lte('end', endDate.format('YYYY-MM-DD'))
            .order('created_at', { ascending: false });

        if (error) { throw error; }
        response.data = data;

    } catch (error) {
        response.success = false;
        response.error = error.message;
    }

    return response;
}