import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json } from '@sveltejs/kit';
import path from 'path';
import mime from 'mime-types';

export async function POST({ request, cookies }) {
	const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( !['super-admin', 'dependence', 'governor', 'chief'].includes(userData.data.role) ) throw redirect(301, '/');

	const data = await request.formData();
	const project = data.get('project');
	const typeFile = data.get('typeFile');
	const bucket = data.get('bucket');

	const fileEntries = Array.from(data.entries()).filter(([key, value]) => value instanceof File);

	let UrlPublic;

	for (const [key, file] of fileEntries) {
		const extension = path.extname(file.name);
		const pathname = `${project}/${typeFile}/${crypto.randomUUID()}${extension}`;
	
		const mimeType = mime.lookup(extension) || file.type;
	
		await supabase.storage
			.from(bucket)
			.upload(pathname, file, {
				contentType: mimeType
			});

        const publicUrl = await supabase.storage.from(bucket).getPublicUrl(pathname);

		UrlPublic = publicUrl.data.publicUrl;

		break;
	}

	return json({
		success: 200,
		url: UrlPublic
	});
}