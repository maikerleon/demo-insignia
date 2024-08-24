import { redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'governor', 'chief', 'super-view'].includes(userData.data.role) ) throw redirect(301, '/');

    let { data: dependences } = await supabase
        .from('dependences')
        .select('id, name, abbr')
        .eq('deleted', false)
        .order('name', { ascending: true });

    const dependences_temp = dependences && dependences.length > 0 ? dependences.map(dependence => ({ label: dependence.name, value: dependence.id, abbr: dependence.abbr, visible: true })) : [];

    let { data: managers } = await supabase
        .from('admins')
        .select('id, name, lastname_father')
        .eq('role', 'dependence')
        .eq('deleted', false)
        .order('name', { ascending: true });

    const managers_temp = managers && managers.length > 0 ? managers.map(manager => ({ label: `${manager.name} ${manager.lastname_father}`, value: manager.id, visible: true })) : [];

    return {
        dependences: dependences_temp,
        managers: managers_temp
    };

};