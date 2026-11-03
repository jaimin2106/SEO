import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://mock-supabase-url.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "mock-anon-key";

const isMockMode = !import.meta.env.VITE_SUPABASE_URL;

if (isMockMode) {
  console.warn(
    "VITE_SUPABASE_URL is missing. Supabase is running in simulation mode. Authentication and Database operations will be mocked locally."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,        // Keep session alive across page refreshes
    autoRefreshToken: true,      // Silently refresh JWT before expiry
    detectSessionInUrl: true,    // Handle magic link / OAuth callbacks from URL hash
    storageKey: "seohub-auth",   // Namespaced key to avoid localStorage conflicts
  },
});

export { isMockMode };
