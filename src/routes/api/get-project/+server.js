import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';
import { statutes as statutesData } from '$lib/data.js';

export async function POST({ request, cookies }) {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if (!['super-admin', 'super-view', 'governor', 'chief', 'dependence'].includes(userData.data.role)) throw redirect(301, '/');

    const data = await request.formData();
    const typeProject = data.get('typeProject');
    const dependence = data.get('dependence');

    const response = await searchProject(typeProject, dependence);

    return json({
        success: response.success,
        data: response.data
    });
}

const searchProject = async (typeProject, dependence) => {
    let response = { success: true, error: null };
    let statutes = [];
    let statutesArray = statutesData.map(statute => statute.value);

    if (typeProject === 'past') {
        statutes = ['active-process', 'finished'];
    } else if (typeProject === 'missing') {
        statutes = ['not-activated'];
    } else if (typeProject === 'future') {
        statutes = ['approved-waiting', 'waiting-approval'];
    }

    try {
        let query = supabase
            .from('project_with_event_date')
            .select('*')
            .eq('deleted', false);

        if (dependence !== 'all') {
            query = query.eq('dependence->data->>value', dependence);
        }

        if (statutes.length > 0) {
            query = query.in('status', statutes);
        }

        const { data, error } = await query;

        if (error) { throw error }

        const sortedData = data.sort((a, b) => {
            const indexA = statutesArray.findIndex(statute => statute === a.status);
            const indexB = statutesArray.findIndex(statute => statute === b.status);

            if (indexA === -1) return 1;
            if (indexB === -1) return -1;

            return indexA - indexB;
        });

        response.data = sortedData;

    } catch (error) {
        response.success = false;
        response.error = error;
    }

    return response;
};