import { createClient } from '@supabase/supabase-js';

// కింద ఉన్న URL మరియు KEY ప్లేస్ లో మీ Supabase నుండి కాపీ చేసినవి పెట్టండి
const supabaseUrl = 'https://wrneiatbhnbxoswzrxea.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndybmVpYXRiaG5ieG9zd3pyeGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzIzMTEsImV4cCI6MjEwNjk0ODMxMX0.LGAYuUu1vqg2O4vGzeOjZ3SPFggzPo3U_y9JgNZbk10';

export const supabase = createClient(supabaseUrl, supabaseKey);