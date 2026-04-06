// Supabase Configuration (public key only - safe for frontend)
const SUPABASE_URL = 'https://uybvxwjidliyvraaqeop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YnZ4d2ppZGxpeXZyYWFxZW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0Njg3MTQsImV4cCI6MjA5MDA0NDcxNH0.CguMy1N1R5DDZu2YL1qaOFiiiXXj8zv2S2jq21AYc-M';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
