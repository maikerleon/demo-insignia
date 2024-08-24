import { fail, redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { validateEmail } from '$lib/utilities';
import { registerLogs } from '$lib/server/register-logs.server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SECRET_KEY } from '$env/static/private';

export const actions = {
    login: async ({request, cookies}) => {
        const formData = await request.formData();
        const email = formData.get('email');
        const password = formData.get('password');

        const device = await request.headers.get('user-agent');
        const ip = await request.headers.get('x-forwarded-for') || 'localhost';

        const dataReturn = {email, password};
        
        if( !validateEmail(email) ) {
            return fail(400, {
                ...dataReturn,
                error: true,
                message: 'Correo electrónico inválido.',
            })
        }

        const validUser = await validateUser( email );

        if ( validUser.error != null ) {
            return fail(400, {
                ...dataReturn,
                error: true,
                message: 'Ha ocurrido un error inesperado, intente nuevamente.',
            })
        }

        const userExisted = validUser.data.some(() => true);
        const match = userExisted ? await bcrypt.compare(password, validUser.data[0].password) : false;

        if ( !userExisted || !match ) {
            return fail(400, {
                ...dataReturn,
                password,
                error: true,
                message: 'Tu nombre de correo o contraseña son invalidas.',
            })
        }

        if ( !validUser.data[0].active ) {
            return fail(400, {
                ...dataReturn,
                password,
                error: true,
                message: 'Debes verificar tu correo electrónico antes de poder ingresar.',
            })
        }

        if (userExisted && match) {

            const secretKey = SECRET_KEY;
            const payload = { 
                id: validUser.data[0].id, 
                email, 
                name: validUser.data[0].name, 
                lastname_father: validUser.data[0].lastname_father,
                lastname_mother: validUser.data[0].lastname_mother,
                role: validUser.data[0].role,
                phone: validUser.data[0].phone,
                municipality: validUser.data[0].municipality,
                dependence: validUser.data[0].dependence,
                photo: validUser.data[0].photo,
                ext: validUser.data[0].ext,
                coordination: validUser.data[0].coordination?.municipalities ?? []
            };

            const expiresIn = '1d';
            const token = jwt.sign(payload, secretKey, { expiresIn });

            cookies.set('token', token, {
                path: '/',
                maxAge: 1 * 24 * 60 * 60
            });

            const registerLog = registerLogs(validUser.data[0].id, ip, device, 'login');

            if ( registerLog.error != null ) {
                return fail(400, {
                    ...dataReturn,
                    error: true,
                    message: 'Ha ocurrido un error inesperado, intente nuevamente.',
                })

            }

            throw redirect(307,'/inicio');
        }

        return { 
            ...dataReturn,
            error: true,
            message: 'Ha ocurrido un error inesperado, intente nuevamente.'    
        };
        
    }
}

const validateUser = async ( email ) => {
    let { data, error } = await supabase
        .from('admins')
        .select('name, lastname_father, lastname_mother, role, password, active, phone, municipality, coordination, dependence, id, photo, ext')
        .eq('email', email)
        .eq('deleted', false)
    return {data, error}
}