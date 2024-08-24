import { verifyToken } from '$lib/server/auth.server.js';
import supabase from '$lib/supabase.js';
import { json, redirect } from '@sveltejs/kit';
import moment from 'moment';

export async function GET({ request, cookies }) {
    const token = cookies.get('token');
    let userData = verifyToken(token);
    if ( !userData.auth ) throw redirect(307, '/salir');
    if (!['super-admin', 'super-view', 'governor', 'chief'].includes(userData.data.role)) throw redirect(301, '/');

    const response = await searchEvents();

    return json({
        success: response.success,
        data: {
            past: response.past,
            present: response.present,
            future: response.future
        }
    });
}

const searchEvents = async () => {
    let response = { success: true, error: null, past: [], present: [], future: [] };
  
    try {
      const startOfLastMonth = moment().startOf('month').subtract(1, 'month').format();
      const startOfCurrentMonth = moment().startOf('month').format();
      const startOfNextMonth = moment().startOf('month').add(1, 'month').format();
      const startOfTheMonthAfterNext = moment().startOf('month').add(2, 'month').format();
  
      const { data, error } = await supabase
        .from('actions')
        .select('id, name, start')
        .gte('start', startOfLastMonth)
        .lt('start', startOfTheMonthAfterNext)
        .eq('deleted', false)
        .eq('type', 'event');
  
      if (error) throw error;
  
      data.forEach(item => {
        const startDate = moment(item.start);
        if (startDate.isBefore(moment(startOfCurrentMonth))) {
          response.past.push(item);
        } else if (startDate.isSameOrAfter(moment(startOfCurrentMonth)) && startDate.isBefore(moment(startOfNextMonth))) {
          response.present.push(item);
        } else if (startDate.isSameOrAfter(moment(startOfNextMonth)) && startDate.isBefore(moment(startOfTheMonthAfterNext))) {
          response.future.push(item);
        }
      });
  
    } catch (error) {
      response.success = false;
      response.error = error;
    }
  
    return response;
  };
