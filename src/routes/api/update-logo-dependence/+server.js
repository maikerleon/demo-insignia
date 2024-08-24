import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json } from '@sveltejs/kit';
import path from 'path';
import mime from 'mime-types';

export async function POST({ request, cookies }) {
	const token = cookies.get('token');
    let userData = verifyToken(token);

    if ( !userData.auth ) throw redirect(307, '/salir');

	const data = await request.formData();
	const id = data.get('dependence');

	let object;

	const fileEntries = Array.from(data.entries()).filter(([key, value]) => value instanceof File);

	for (const [key, file] of fileEntries) {
		const extension = path.extname(file.name);
		const pathname = `${id}/${crypto.randomUUID()}${extension}`;
	
		const mimeType = mime.lookup(extension) || file.type;
	
		const resp = await supabase.storage
			.from('dependences')
			.upload(pathname, file, {
				contentType: mimeType
			});

        const publicUrl = await supabase.storage.from('dependences').getPublicUrl(pathname);

		const { data: dataActual } = await supabase
			.from('dependences')
			.select('logo')
			.eq('id', id)
			.limit(1);

		object = publicUrl.data.publicUrl;

		const { error } = await supabase
            .from('dependences')
            .update({ logo: object })
            .eq('id', id);

        if (error) {
            throw error;
        }

		break;
	}

	return json({
		success: 200,
		url: object
	});
}