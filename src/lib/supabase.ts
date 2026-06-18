import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://duodhhylswepgftejfot.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1b2RoaHlsc3dlcGdmdGVqZm90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE3MjYzNzEsImV4cCI6MjA5NzMwMjM3MX0.kYzNiQkzGg60aB_eKYnHYsylZXgTwu0Fb5a6iRZmfg0";

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
