import { fail, redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifySession } from '$lib/server/verify-session.server';
import { verifyToken } from '$lib/server/auth.server';
import { registerLogs } from '$lib/server/register-logs.server';
import { capitalizeString, validateString, validatePhoneNumber, validateEmail } from '$lib/utilities';
import { SECRET_KEY } from '$env/static/private';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    const {auth} = await verifySession(token);
    if (!auth) throw redirect(307, '/salir');
};

export const actions = {
    personal: async ({request, cookies}) => {
        const token = cookies.get('token');
        let userData = verifyToken(token);
        if ( !userData.auth ) throw redirect(307, '/salir');

        const formData = await request.formData();

        let name = formData.get('name');
        let lastname_father = formData.get('lastname_father');
        let lastname_mother = formData.get('lastname_mother');
        let phone = formData.get('phone');
        let email = formData.get('email');

        const dataReturn = {name, lastname_father, lastname_mother, phone, email};

        name = capitalizeString(name);
        lastname_father = capitalizeString(lastname_father);
        lastname_mother = capitalizeString(lastname_mother);
        email = email.toLowerCase().trim();
        phone = phone.trim();

        try {
            if ( !validateString(name,false,3,20) ) throw new Error('nombre');
            if ( !validateString(lastname_father,false,3,10) ) throw new Error('apellido paterno');
            if ( lastname_mother.length > 0 && !validateString(lastname_mother,false,3,10) ) throw new Error('apellido materno');
            if ( !validatePhoneNumber(phone) ) throw new Error('teléfono');
            if ( !validateEmail(email) ) throw new Error('correo');

            const available = await requestAvailable(email);

            if (!available?.data || available.error) throw new Error('inesperado');
            if (available.data.length > 0 && available.data[0].id !== userData.data.id) throw new Error('correo que no pertenezca a otro usuario');

            const response = await updateProfile({email, name, lastname_father, lastname_mother, phone}, userData.data.id);

            if ( !response.success ) throw new Error('inesperado');

            const secretKey = SECRET_KEY;
            const payload = { 
                email, 
                name, 
                lastname_father,
                lastname_mother,
                phone,
                id: userData.data.id,
                role: userData.data.role,
                municipality: userData.data.municipality,
                entity: userData.data.entity,
                dependence: userData.data.dependence,
                photo: userData.data.photo,
                ext: userData.data.ext
            };

            const expiresIn = '1d';
            const token = jwt.sign(payload, secretKey, { expiresIn });

            cookies.set('token', token, {
                path: '/',
                maxAge: 1 * 24 * 60 * 60
            });

            const device = await request.headers.get('user-agent');
            const ip = await request.headers.get('x-forwarded-for') || 'localhost';
            await registerLogs(userData.data.id, ip, device, `Ha editado su perfil`);

            return fail(400, {
                success: true,
                type: 'personal',
                data: {...dataReturn}
            })

        } catch ({message}) {
            const template = message === 'inesperado' ? 'Ha ocurrido un error inesperado, intente nuevamente.' : `Por favor ingrese un ${message} válido.`;
            return fail(400, {
                error: true,
                message: template,
                type: 'personal',
                data: {...dataReturn}
            })
        }
        
    },
    password: async ({request, cookies}) => {
        const token = cookies.get('token');
        let userData = verifyToken(token);
        if ( !userData.auth ) throw redirect(307, '/salir');

        const formData = await request.formData();

        let actual_password = formData.get('actual_password');
        let new_password = formData.get('new_password');
        let confirm_password = formData.get('confirm_password');

        actual_password = actual_password.trim();
        new_password = new_password.trim();
        confirm_password = confirm_password.trim();

        const dataReturn = {actual_password, new_password, confirm_password};

        try {
            if ( actual_password.length > 7 && actual_password < 30 ) throw new Error('Ingrese la contraseña actual de manera correcta.');
            if ( actual_password.length > 7 && actual_password < 30 ) throw new Error('Ingrese la nueva contraseña de manera correcta.');
            if ( actual_password.length > 7 && actual_password < 30 ) throw new Error('Ingrese la confirmación de su contraseña de manera correcta.');
            if ( actual_password.trim() === new_password.trim() ) throw new Error('Su nueva contraseña debe ser diferente a la actual.');
            if ( new_password.trim() !== confirm_password.trim() ) throw new Error('Debe repetir su contraseña correctamente.');

            const response = await changePassword(actual_password, new_password, userData.data.email);

            if ( !response.success ) throw new Error(response.error);

            const device = await request.headers.get('user-agent');
            const ip = await request.headers.get('x-forwarded-for') || 'localhost';
            await registerLogs(userData.data.id, ip, device, `Ha cambiado su contraseña`);

            return {
                success: true,
                type: 'password',
                data: {...dataReturn}
            }

        } catch ({message}) {
            return fail(400, {
                error: true,
                message: message,
                type: 'password',
                data: {...dataReturn}
            })
        }
        
    }
}

const updateProfile = async (data, id) => {

    const { error } = await supabase
    .from('admins')
    .update(data)
    .eq('id', id);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
};

const changePassword = async (oldPassword, newPassword, email) => {
    
    let response = {success: true, error: null}

    try {
        const { data: users, error: userError } = await supabase
            .from('admins')
            .select('password')
            .eq('email', email);
        
        if (userError) { throw userError }

        const userExisted = users && users.length === 1;

        const match = userExisted ? await bcrypt.compare(oldPassword, users[0].password) : false;

        if (!match) {
            throw new Error('La contraseña proporcionada no coincide con la contraseña actual.');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        const { error: updateError } = await supabase
            .from('admins')
            .update({ password: hashedNewPassword })
            .eq('email', email);

        if (updateError) { throw updateError }

    } catch (error) {
        response.error = error.message;
        response.success = false;
    }

    return response;
};

const requestAvailable = async (email) => {
    let { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('email', email)
        .eq('deleted', false)
    return {data, error}
}