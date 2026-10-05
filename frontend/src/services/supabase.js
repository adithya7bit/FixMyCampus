import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://odtqxytzethpsygotxyc.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdHF4eXR6ZXRocHN5Z290eHljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTExMTYsImV4cCI6MjEwNjA2NzExNn0.KLoOp5Y9blj5VKYhm6DuttooHku1XfuQdKz0NZMvhIk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
