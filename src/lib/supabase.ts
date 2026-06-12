import { createClient } from "@supabase/supabase-js";

// Helper to clean any miscopied sub-paths from the Supabase URL (e.g. /rest/v1 or /storage/v1)
export function cleanSupabaseUrl(url: string): string {
  if (!url) return "";
  let cleaned = url.trim();
  cleaned = cleaned
    .replace(/\/rest\/v1\/?$/, "")
    .replace(/\/storage\/v1\/?$/, "")
    .replace(/\/auth\/v1\/?$/, "");
  return cleaned.replace(/\/+$/, "");
}

// Lazy initialize or retrieve credentials from environment
const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// Check if we have credentials stored in localStorage as well to let the user configure it directly in UI!
const localUrl = localStorage.getItem("minerador_supabase_url");
const localKey = localStorage.getItem("minerador_supabase_key");

export const supabaseUrl = cleanSupabaseUrl(rawUrl || localUrl || "");
export const supabaseAnonKey = (rawKey || localKey || "").trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to save Supabase keys on the fly
export function saveSupabaseCredentials(url: string, key: string) {
  if (url && key) {
    const cleanedUrl = cleanSupabaseUrl(url);
    const cleanedKey = key.trim();
    localStorage.setItem("minerador_supabase_url", cleanedUrl);
    localStorage.setItem("minerador_supabase_key", cleanedKey);
    window.location.reload();
  }
}

// Helper to clear custom Supabase keys
export function clearSupabaseCredentials() {
  localStorage.removeItem("minerador_supabase_url");
  localStorage.removeItem("minerador_supabase_key");
  window.location.reload();
}
