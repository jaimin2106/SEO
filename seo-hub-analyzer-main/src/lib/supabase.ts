import { createClient } from "@supabase/supabase-js";

const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
const configuredAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isMockMode = !configuredUrl && !configuredAnonKey;

if (Boolean(configuredUrl) !== Boolean(configuredAnonKey)) {
  throw new Error("Set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

if (import.meta.env.PROD && isMockMode) {
  throw new Error("Supabase environment variables are required in production.");
}

const supabaseUrl = configuredUrl || "https://mock-supabase-url.supabase.co";
const supabaseAnonKey = configuredAnonKey || "mock-anon-key";

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
