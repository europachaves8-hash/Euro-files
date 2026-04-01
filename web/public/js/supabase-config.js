// Supabase Configuration (public key only - safe for frontend)
const SUPABASE_URL = 'https://uybvxwjidliyvraaqeop.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_E3p3hWyq-pD91F6XRY-Qxw_BRit8qdz';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
