import { createClient } from '@supabase/supabase-js';

// تنظيف الرابط والمفتاح من أي مسافات أو رموز زائدة
const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabaseUrl = rawUrl.trim().replace(/\/+$/, '');
const supabaseAnonKey = rawKey.trim();

export const supabase = createClient(supabaseUrl, supabaseAnonKey);