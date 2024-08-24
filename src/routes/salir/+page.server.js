import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageLoad} */
export async function load({cookies}) {
    cookies.set('token', '', {
        path: '/',
        maxAge: 10
    });

    throw redirect(307, '/');
}