import { verifyToken } from '$lib/server/auth.server.js';

export const load = async ({ cookies }) => {

	const token = cookies.get('token');
    let userData = verifyToken(token);
	let login = true;

    if ( !userData.auth ) login = false;
	
	return {
		login,
		role: userData.data.role,
		name: userData.data.name,
		lastname_father: userData.data.lastname_father,
		lastname_mother: userData.data.lastname_mother,
		dependence: userData.data.dependence,
		municipality: userData.data.municipality,
		coordination: userData.data.coordination,
		email: userData.data.email,
		phone: userData.data.phone,
		ext: userData.data.ext,
		photo: userData.data.photo
	};
};