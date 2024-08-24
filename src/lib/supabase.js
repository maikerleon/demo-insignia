import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLIC_KEY, SUPABASE_URL } from '$env/static/private';

let session = null
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLIC_KEY, {
  persistSession: true,
  persistSessionStorage: {
    getItem: () => session,
    setItem: (value) => {
      session = value
    },
    removeItem: () => {
      session = null
    },
  },
})
export default supabase