import { redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'governor', 'chief', 'super-view', 'supervisor', 'dependence'].includes(userData.data.role) ) throw redirect(301, '/');

    let query = supabase
        .from('dependences')
        .select('id, name, abbr')
        .eq('deleted', false)
        .order('name', { ascending: true });

    if (userData.data.role === 'dependence') {
        query = query.eq('id', userData.data.dependence);
    }

    const { data: dependences } = await query;

    const dependences_temp = dependences && dependences.length > 0 ? dependences.map(dependence => ({ label: dependence.name, value: dependence.id, abbr: dependence.abbr, visible: true })) : [];

    return {
        dependences: dependences_temp
    };

};