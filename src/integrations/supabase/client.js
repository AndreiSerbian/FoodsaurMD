
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qpljdodpbygbwnskuxsq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbGpkb2RwYnlnYnduc2t1eHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjc5MjQsImV4cCI6MjA2MzcwMzkyNH0.BRwlCfQrqXChl1u0z5f8NRH6fYU0MXYsYOolE4jwcps'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
