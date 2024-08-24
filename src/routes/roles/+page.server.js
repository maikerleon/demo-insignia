import { fail, redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';
import { verifyToken } from '$lib/server/auth.server';
import { registerLogs } from '$lib/server/register-logs.server';
import { capitalizeString, validateString, validateEmail, validatePhoneNumber, canRegisterRole } from '$lib/utilities';
import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT, URL_GENERAL } from '$env/static/private';
import bcrypt from 'bcrypt';

export const load = async ({ cookies }) => {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if ( ['register'].includes(userData.data.role) ) throw redirect(301, '/');
    
    let adminsRequest = supabase
        .from('admins')
        .select('name, lastname_father, lastname_mother, email, phone, dependence, municipality, role, id, photo, coordination')
        .eq('deleted', false);

    if (userData.data.role === 'dependence') {
        adminsRequest = adminsRequest
            .eq('dependence', userData.data.dependence)
            .in('role', ['coordinator', 'municipality', 'register']);
    }
    if (userData.data.role === 'coordination') {
        adminsRequest = adminsRequest
            .eq('dependence', userData.data.dependence)
            .in('role', ['municipality', 'register'])
            .in('municipality', userData.data.coordinator);
    }
    if (userData.data.role === 'municipality') {
        adminsRequest = adminsRequest
            .eq('dependence', userData.data.dependence)
            .eq('role', 'register')
            .eq('municipality', userData.data.municipality);
    }

    const { data } = await adminsRequest;

    let dependencesRequest = supabase
        .from('dependences')
        .select('id, name')
        .eq('deleted', false);

    const { data:dependences } = await dependencesRequest;

    return {
        admins: data,
        dependences: dependences
    }

};

export const actions = {
    rol: async ({request, cookies}) => {
        const token = cookies.get('token');
        let userData = verifyToken(token);

        if ( !userData.auth ) throw redirect(307, '/salir');
        if ( ['super-view', 'supervisor', 'register', 'chief', 'governor'].includes(userData.data.role) ) throw redirect(307, '/salir');
        
        const formData = await request.formData();
        let id = formData.get('id');
        let role = formData.get('role');
        let name = formData.get('name');
        let lastname_father = formData.get('lastname_father');
        let lastname_mother = formData.get('lastname_mother');
        let phone = formData.get('phone');
        let email = formData.get('email');
        let dependence = formData.get('dependence');
        let municipality = formData.get('municipality');
        let coordination = formData.get('coordination');
        coordination = JSON.parse(coordination);
        
        let coordinationObj = null;

        if (coordination) {
            const municipiosObj = coordination.map(objeto => objeto.value);
            coordinationObj = { municipalities: municipiosObj };
        }

        const dataReturn = {id, role, name, lastname_father, lastname_mother, phone, email, dependence, municipality: Number(municipality), coordination: coordinationObj};
        
        name = capitalizeString(name);
        lastname_father = capitalizeString(lastname_father);
        lastname_mother = capitalizeString(lastname_mother);
        
        try {

            if ( !role || !['super-admin', 'super-view', 'governor', 'chief', 'supervisor', 'dependence', 'coordination', 'municipality', 'register'].includes(role) ) throw new Error('un rol válido');
            
            if ( !validateString(name,false,3,40) ) throw new Error('un nombre válido');
            
            if ( !validateString(lastname_father,false,3,40) ) throw new Error('un apellido paterno válido');
            
            if ( lastname_mother !== '' && !validateString(lastname_mother,false,3,40) ) throw new Error('un apellido materno válido');
            
            if ( phone !== '' && !validatePhoneNumber(phone) ) throw new Error('un teléfono válido');
            
            if ( !validateEmail(email) ) throw new Error('un correo válido');

            if ( !canRegisterRole(userData.data.role, role) ) throw new Error('inesperado');

            if ( role === 'super-admin' && !['super-admin'].includes(userData.data.role)  ) {
                throw new Error('inesperado');
            }

            if ( role === 'super-view' && !['super-admin'].includes(userData.data.role)  ) {
                throw new Error('inesperado');
            }

            if ( role === 'dependence' && !['super-admin'].includes(userData.data.role)  ) {
                throw new Error('inesperado');
            }else if ( role === 'dependence' && !dependence) {
                throw new Error('una dependencia válida');
            }

            if ( role === 'coordination' && !['super-admin','dependence'].includes(userData.data.role)  ) {
                throw new Error('inesperado');
            }else if ( role === 'coordination') {
                if ( !coordination || coordination.length === 0 ) throw new Error('municipios para la coordinación');
            }

            if ( role === 'municipality' && !['super-admin','dependence','coordination'].includes(userData.data.role)  ) {
                throw new Error('inesperado');
            }else if ( role === 'municipality' && !municipality) {
                throw new Error('un municipio válido');
            }

            if ( role === 'register' && !['super-admin','dependence','coordination','municipality'].includes(userData.data.role)  ) {
                throw new Error('inesperado');
            }else if ( role === 'register' && !municipality) {
                throw new Error('un municipio válido');
            }

            const create = !id ? true : false;

            const uniqueID = crypto.randomUUID();
            const available = await requestAvailable(email, create);

            if (!available?.data || available.error) throw new Error('inesperado');
            if (available.data.length > 0 && available.data[0].id !== id) throw new Error('un correo que no pertenezca a otro usuario');

            let response;

            if (create) {
                const uuid_password = crypto.randomUUID();
                const password = await bcrypt.hash(uuid_password, 10);
                
                response = await registerAdmin({id:uniqueID, name, lastname_father, lastname_mother, municipality, dependence, created_by: userData.data.id, role, phone, email, coordination: coordinationObj
                , password});
                await sendEmail(name, lastname_father, email, uuid_password);
            } else {
                response = await editAdmin({id, name, lastname_father, lastname_mother, municipality, dependence, role, phone, email, coordination: coordinationObj});
            }

            if (!response.success) {
                throw new Error('inesperado');
            }

            const device = await request.headers.get('user-agent');
            const ip = await request.headers.get('x-forwarded-for') || 'localhost';
            
            await registerLogs(userData.data.id, ip, device, `Ha ${create ? 'creado' : 'editado'} el role ${role} para ${uniqueID}`);

            if (create) {
                dataReturn.id = uniqueID;
            }

            return fail(400, {
                success: true,
                create,
                data: {...dataReturn}
            })

        } catch ({message}) {
            const template = message === 'inesperado' ? 'Ha ocurrido un error inesperado, intente nuevamente.' : `Por favor ingrese ${message}.`;
            return fail(400, {
                error: true,
                message: template,
                data: {...dataReturn}
            })
        }
        
    }
}

const registerAdmin = async (data) => {

    const { error } = await supabase
    .from('admins')
    .insert([data]);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
}

const editAdmin = async (data) => {

    const { error } = await supabase
    .from('admins')
    .update(data)
    .eq('id', data.id);

    if (error) {
        return { success: false, message: error.message };
    }

    return { success: true };
}

const requestAvailable = async (email) => {
    let { data, error } = await supabase
        .from('admins')
        .select('id')
        .eq('email', email)
        .eq('deleted', false)
    return {data, error}
}

const sendEmail = async (name, lastname_father, email, password) => {
    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: EMAIL_PORT,
        secure: false,
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASSWORD
        },
    });

    const htmlTemplate = `
        <div style="width: 100%; background: #f3f4f6; border-radius: 20px; padding: 40px 0px;"> 
            <section style="max-width: 42rem; padding: 2.5rem; margin: auto; background-color: #fff; border-radius: 30px;">
                <header>
                    <a href="/">
                        <img style="width: auto; height: 1.75rem; margin: 0;" src="https://merakiui.com/images/full-logo.svg" alt="Logo de insignia">
                    </a>
                </header>

                <main style="margin-top: 2rem;">
                    <h2 style="color: #4b5563; font-size: 26px">Hola ${name} ${lastname_father},</h2>

                    <p style="margin-top: 0.5rem; line-height: 1.75; color: #4b5563; font-size: 18px">
                        Has sido invitad@ a participar en <span style="font-weight: 600;">Insignia Coahuila</span>.
                    </p>
                    
                    <a href="${URL_GENERAL}" style="padding: 0.5rem 1.5rem; margin-top: 1.5rem; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.05em; color: #fff; text-transform: capitalize; transition-property: background-color, color; transition-duration: 0.3s; transform: none; background-color: #1d8a9d; border-radius: 0.5rem; cursor: pointer; border: none; outline: none; box-shadow: none; text-decoration: none;">Ir a la plataforma</a>
                    
                    <p style="margin-top: 2rem; color: #4b5563;">
                        Correo: ${email} <br>
                        Contraseña provicional: ${password} <br><br>
                        Por favor cambie su contraseña al ingresar a la plataforma.
                    </p>
                </main>
                

                <footer style="margin-top: 2rem;">
                    <p style="color: #6b7280;">
                        Este correo fue enviado a <a href="mailto:${email}" style="color: #3b82f6; text-decoration: underline;" target="_blank">${email}</a>. Si considera que se trata de un error, ignore este mensaje.
                    </p>

                    <p style="margin-top: 0.75rem; color: #6b7280;">© <span style="font-weight: 600;">${ new Date().getFullYear() }</span> Insignia Coahuila.</p>
                </footer>
            </section>
        </div>
    `;

    const mailOptions = {
    from: `Insignia Coahuila <${EMAIL_USER}>`,
    to: `${email}`,
    subject: 'Invitación a Insignia Coahuila',
    html: htmlTemplate
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return false;
        } else {
          return true;
        }
    });

    return true;
}