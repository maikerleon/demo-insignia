import { redirect } from '@sveltejs/kit';
import { verifyToken } from '$lib/server/auth.server';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if (!userData.auth) throw redirect(307, '/salir');
    if (!['super-admin', 'super-view', 'governor', 'chief'].includes(userData.data.role)) throw redirect(301, '/');
};