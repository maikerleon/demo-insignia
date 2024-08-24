import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';
import path from 'path';
import mime from 'mime-types';
import { SECRET_KEY } from '$env/static/private';
import jwt from 'jsonwebtoken';

export async function POST({ request, cookies }) {
    const token = cookies.get('token');
    let userData = verifyToken(token);

    if (!userData.auth) throw redirect(307, '/salir');

    const data = await request.formData();
	const id = userData.data.id;

    const fileEntries = Array.from(data.entries()).filter(([, value]) => value instanceof File);
    const file = fileEntries[0][1];

    try {
        const extension = path.extname(file.name);
        const pathname = `${crypto.randomUUID()}${extension}`;

        const mimeType = mime.lookup(extension) || file.type;

		const {data} = await supabase
			.from('admins')
			.select('photo')
			.eq('id', id)

		const actualPhoto = data[0].photo ? data[0].photo.split('/').pop() : null;

		if (actualPhoto) {
			await supabase.storage
				.from('profiles')
				.remove([`${actualPhoto}`]);
		}

        await supabase.storage
            .from('profiles')
            .upload(pathname, file, {
                contentType: mimeType
            });

		const publicUrl = await supabase.storage.from('profiles').getPublicUrl(pathname);

		await supabase
			.from('admins')
			.update({ "photo": publicUrl.data.publicUrl, "ext": pathname})
			.eq('id', id)

		const secretKey = SECRET_KEY;
		const payload = { 
			email: userData.data.email, 
			name: userData.data.name, 
			lastname_father: userData.data.lastname_father,
			lastname_mother: userData.data.lastname_mother,
			phone: userData.data.phone,
			role: userData.data.role,
			municipality: userData.data.municipality,
			entity: userData.data.entity,
			dependence: userData.data.dependence,
			photo: publicUrl.data.publicUrl,
			ext: pathname
		};

		const expiresIn = '1d';
		const token = jwt.sign(payload, secretKey, { expiresIn });

		cookies.set('token', token, {
			path: '/',
			maxAge: 1 * 24 * 60 * 60
		});

        return json({
            success: true,
			photo: publicUrl.data.publicUrl
        });

    } catch (error) {
        return json({
            success: false
        });
    }
}
