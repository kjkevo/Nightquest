import { createClient } from '@supabase/supabase-js'

// Public anon key — safe to ship in client bundles.
// Only grants access to Realtime Presence channels; no database tables are used.
const SUPABASE_URL      = 'https://lxupobdvfftvgdpzgsit.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4dXBvYmR2ZmZ0dmdkcHpnc2l0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzA2ODgsImV4cCI6MjA5NjEwNjY4OH0.LA6hs9ZYfbVlQms1EAEC384e8BVl6kBG1ZyfOvkC33A'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})
