import supabase from '$lib/supabase.js';
import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { EMAIL_USER, EMAIL_PASSWORD, EMAIL_HOST, EMAIL_PORT, URL_GENERAL } from '$env/static/private';
import bcrypt from 'bcrypt';
import { timesTampTz } from '$lib/utilities.js';

export async function POST({ request }) {
    const data = await request.formData();
    const email = data.get('email');

    const uuid = crypto.randomUUID();
    const password = await bcrypt.hash(uuid, 10);

    const user = await requestAvailable(email);

    if (!user) return json({ success: false, message: 'El usuario no existe' });

    await restoreCodes(user.id);

    const code = crypto.randomUUID();

    const { error } = await supabase
        .from('resets')
        .insert([{ 
            admin: user.id,
            expiration: timesTampTz(1),
            code
        }]);

    if ( error ) {
        return json({ success: false, message: error });
    }

    await sendEmail(user.name, user.lastname_father, email, code);

    return json({
        success: true
    });
}

const requestAvailable = async (email) => {
    let { data } = await supabase
        .from('admins')
        .select('id, name, lastname_father')
        .eq('email', email)
        .eq('deleted', false)
    return data[0];
}

const restoreCodes = async (admin) => {
    await supabase
        .from('resets')
        .update([{used: true}])
        .eq('admin', admin)
        .eq('used', false)
}

const sendEmail = async (name, lastname_father, email, code) => {
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

                    <p style="margin-top: 0.5rem; line-height: 1.75; color: #4b5563; font-size: 18px;">
                        Para restablecer tu cuenta haz clic en <span style="font-weight: 600;">restablecer contraseña</span>.
                    </p>
                    
                    <a href="${URL_GENERAL}restablecer/${code}" style="padding: 0.5rem 1.5rem; margin-top: 1.5rem; font-size: 0.875rem; font-weight: 500; letter-spacing: 0.05em; color: #fff; text-transform: capitalize; transition-property: background-color, color; transition-duration: 0.3s; transform: none; background-color: #1d8a9d; border-radius: 0.5rem; cursor: pointer; border: none; outline: none; box-shadow: none; text-decoration: none;">Restablecer contraseña</a>
                    
                    <p style="margin-top: 2rem; color: #4b5563;">
                        Si tu no has solicitado un restablecimiento de tu contraseña, <br>
                        solo ignora este mensaje.
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
    subject: 'Restablecer contraseña de Insignia Coahuila',
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