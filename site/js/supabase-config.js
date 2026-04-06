// Supabase Configuration (public key only - safe for frontend)
const SUPABASE_URL = 'https://fhylytcuuezuyhyqrbxb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoeWx5dGN1dWV6dXloeXFyYnhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzODQ5OTgsImV4cCI6MjA4OTk2MDk5OH0.S1FrGz5cj1hvcZUvcHXCJmvLkyKPpbsU0yX1qwsjf7s';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
