// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qpljdodpbygbwnskuxsq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbGpkb2RwYnlnYnduc2t1eHNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgxMjc5MjQsImV4cCI6MjA2MzcwMzkyNH0.BRwlCfQrqXChl1u0z5f8NRH6fYU0MXYsYOolE4jwcps";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);