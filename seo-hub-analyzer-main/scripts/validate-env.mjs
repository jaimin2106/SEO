import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const env = { ...loadEnv("production", projectRoot, ""), ...process.env };
const requiredVariables = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];
const missingVariables = requiredVariables.filter((name) => !env[name]?.trim());

if (Boolean(env.VITE_SUPABASE_URL) !== Boolean(env.VITE_SUPABASE_ANON_KEY)) {
  throw new Error("Set both VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

if (env.VITE_SUPABASE_URL) {
  let supabaseUrl;
  try {
    supabaseUrl = new URL(env.VITE_SUPABASE_URL);
  } catch {
    throw new Error("VITE_SUPABASE_URL must be a valid absolute URL.");
  }

  if (!new Set(["http:", "https:"]).has(supabaseUrl.protocol)) {
    throw new Error("VITE_SUPABASE_URL must use HTTP or HTTPS.");
  }
}

if (missingVariables.length && env.CONTEXT) {
  throw new Error(`Missing required Netlify environment variables: ${missingVariables.join(", ")}`);
}

if (missingVariables.length) {
  console.warn("Supabase environment is incomplete; local builds will use demo mode.");
} else {
  console.log("Supabase environment variables are configured.");
}