import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin'].includes(userData.data.role) ) throw redirect(301, '/');

	const data = await request.formData();
	
	const project = data.get('project');
	const file = data.get('file');
	const table_delete = data.get('table_delete');
	
	const resource = `${project}/${table_delete}/${file.split('/').pop()}`;

	const { data: dataActual } = await supabase
		.from('projects')
		.select('check_list')
		.eq('id', project)
		.limit(1);

	dataActual[0].check_list[`${table_delete}_files`] = dataActual[0].check_list[`${table_delete}_files`].filter(record => record.file !== file);

	const { error } = await supabase
		.from('projects')
		.update({ check_list: dataActual[0].check_list })
		.eq('id', project);

	if (error) {
		return json({
			success: false
		});
	}

	await supabase.storage
		.from('checklist')
		.remove([`${resource}`]);

	return json({
		success: true
	});
}