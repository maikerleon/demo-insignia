import supabase from '$lib/supabase.js';
import { json } from '@sveltejs/kit';
import bcrypt from 'bcrypt';

export async function POST({ request }) {
    const data = await request.formData();
    const code = data.get('code');
    const new_password = data.get('new_password');
    const confirm_password = data.get('confirm_password');

    if (new_password !== confirm_password) return json({ success: false, message: 'Las contraseñas no coinciden' });
    const valid = await requestAvailable(code);

    if (!valid) return json({ success: false, message: 'El código de restablecimiento ha expirado o ya ha sido utilizado' });
    
    const password = await bcrypt.hash(confirm_password, 10);
    
    const { error } = await supabase
    .from('admins')
    .update([{ password: password }])
    .eq('id', valid.admin);
    
    if ( error ) {
        return json({ success: false, message: 'Error al actualizar la contraseña' });
    }
    
    await deleteCode(code);

    return json({
        success: true
    });
}

const requestAvailable = async (code) => {
    const actualDate = new Date();

    let { data } = await supabase
        .from('resets')
        .select('admin')
        .eq('code', code)
        .eq('used', false)
        .gt('expiration', actualDate.toISOString());
        return data[0];
}

const deleteCode = async (code) => {
    await supabase
        .from('resets')
        .update([{used: true}])
        .eq('code', code)
}