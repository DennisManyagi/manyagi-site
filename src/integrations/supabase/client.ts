import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dlbbjeohndiwtofitwec.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsYmJqZW9obmRpd3RvZml0d2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NzI4MjIsImV4cCI6MjA3MjM0ODgyMn0.6WtKKyv64mT54cLwwT-xd4xiMEHTIURCCEOhHUqGWBk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});