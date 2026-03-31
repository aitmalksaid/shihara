import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vygodaoflahdhkcldkwc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5Z29kYW9mbGFoZGhrY2xka3djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTQ1ODUsImV4cCI6MjA3MDY5MDU4NX0._Jqo4uFPsZx0qkw8pJsEgsxxOp1aLjA-2nxur5VGyT8'; // Remplacez par votre clé API publique

export const supabase = createClient(supabaseUrl, supabaseKey);
