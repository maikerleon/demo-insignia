import { redirect } from '@sveltejs/kit';
import supabase from '$lib/supabase';

export const load = async ({ params }) => {

  const actualDate = new Date();

  let request = supabase
    .from('resets')
    .select('code')
    .eq('code', params.code)
    .eq('used', false)
    .gt('expiration', actualDate.toISOString());

  const { data } = await request;

  if ( !data || data.length === 0 ) throw redirect(307, '/');

  return {
    code: params.code,
  };
}