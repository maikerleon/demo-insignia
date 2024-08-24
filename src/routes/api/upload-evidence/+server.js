import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json } from '@sveltejs/kit';
import path from 'path';
import mime from 'mime-types';
import { timesTampTz } from '$lib/utilities.js';

export async function POST({ request, cookies }) {
	const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');

	const data = await request.formData();
	const id = data.get('id');

	const fileEntries = Array.from(data.entries()).filter(([key, value]) => value instanceof File);

	for (const [key, file] of fileEntries) {
		const extension = path.extname(file.name);
		const pathname = `${id}/${crypto.randomUUID()}${extension}`;
	
		const mimeType = mime.lookup(extension) || file.type;
	
		const resp = await supabase.storage
			.from('actions')
			.upload(pathname, file, {
				contentType: mimeType
			});

        const publicUrl = await supabase.storage.from('actions').getPublicUrl(pathname);

		const { data: dataActual } = await supabase
			.from('actions')
			.select('evidence')
			.eq('id', id)
			.limit(1);

		let object;

		if (dataActual[0].evidence?.data) {
			object = {data: [...dataActual[0].evidence.data, {evidence: publicUrl.data.publicUrl, created_at: timesTampTz(), ext: extension}]};
		}else {
			object = {data: [{evidence: publicUrl.data.publicUrl, created_at: timesTampTz(), ext: extension}]};
		}

		const { error } = await supabase
            .from('actions')
            .update({ evidence: object })
            .eq('id', id);

        if (error) {
            throw error;
        }

		break;
	}

	return json({
		success: 200
	});
}