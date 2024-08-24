import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin'].includes(userData.data.role) ) throw redirect(301, '/');

	const data = await request.formData();
	const action = data.get('action');
	const evidence = data.get('evidence');

	const file = `${action}/${evidence.split('/').pop()}`;

	const { data: dataActual } = await supabase
		.from('actions')
		.select('evidence')
		.eq('id', action)
		.limit(1);

	const object = {data: dataActual[0].evidence.data.filter(record => record.evidence !== evidence)};

	const { error } = await supabase
		.from('actions')
		.update({ evidence: object })
		.eq('id', action);

	if (error) {
		return json({
			success: false
		});
	}

	await supabase.storage
		.from('actions')
		.remove([`${file}`]);

	return json({
		success: true
	});
}