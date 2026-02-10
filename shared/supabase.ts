import { createClient } from '@supabase/supabase-js';

// Configurações do ambiente
const supabaseUrl = process.env.SUPABASE_URL || 'https://supa.agenciatouch.com.br';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'YOUR_SERVICE_KEY';

// Cliente com anon key (usado no frontend - RLS respeita user)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente com service role (usado no backend - ignora RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
