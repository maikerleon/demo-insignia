import supabase from '$lib/supabase';

export const registerLogs = async (email, ip, device, action) => {
    let { data, error } = await supabase
        .from('logs')
        .insert([
            { 
                email,
                ip, 
                device, 
                action 
            },
        ]);

    return {data, error};
}