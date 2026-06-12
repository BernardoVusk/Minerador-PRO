import { supabase, isSupabaseConfigured } from "./supabase";
import { OfferHit } from "../types";

export interface SupabaseSyncResult {
  success: boolean;
  count?: number;
  error?: string;
}

export const SUPABASE_TABLE_NAME = "offer_hits";

/**
 * SQL Schema for creation in Supabase SQL Editor:
 * 
 * create table if not exists public.offer_hits (
 *   id text primary key,
 *   url text not null,
 *   domain text not null,
 *   title text,
 *   tracker text,
 *   platform_name text,
 *   market text,
 *   nicho text,
 *   type text,
 *   score int,
 *   rank text,
 *   scanned_at timestamp with time zone,
 *   uuid text,
 *   screenshot_url text,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 * 
 * -- Enable row level security (RLS) or add standard policies:
 * alter table public.offer_hits enable row level security;
 * create policy "Public read and write" on public.offer_hits
 *   for all using (true) with check (true);
 */

export const SQL_CREATION_SCRIPT = `create table if not exists public.offer_hits (
  id text primary key,
  url text not null,
  domain text not null,
  title text,
  tracker text,
  platform_name text,
  market text,
  nicho text,
  type text,
  score int,
  rank text,
  scanned_at timestamp with time zone,
  uuid text,
  screenshot_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.offer_hits enable row level security;
create policy "Public access and modifications" on public.offer_hits
  for all using (true) with check (true);`;

// Convert local OfferHit to Supabase Row (handling snackcase format for clean tables)
function toSupabaseRow(hit: OfferHit) {
  return {
    id: hit.id,
    url: hit.url,
    domain: hit.domain,
    title: hit.title || "",
    tracker: hit.tracker || "",
    platform_name: hit.platformName || "",
    market: hit.market,
    nicho: hit.nicho,
    type: hit.type,
    score: hit.score,
    rank: hit.rank,
    scanned_at: hit.scannedAt,
    uuid: hit.uuid || null,
    screenshot_url: hit.screenshotUrl || null,
  };
}

// Convert Supabase Row back to OfferHit
function toOfferHit(row: any): OfferHit {
  return {
    id: row.id,
    url: row.url,
    domain: row.domain,
    title: row.title,
    tracker: row.tracker,
    platformName: row.platform_name || "",
    market: row.market as 'BR' | 'Gringa',
    nicho: row.nicho,
    type: row.type,
    score: Number(row.score),
    rank: row.rank as 'S' | 'A' | 'B' | 'C',
    scannedAt: row.scanned_at || row.created_at,
    uuid: row.uuid || undefined,
    screenshotUrl: row.screenshot_url || undefined,
  };
}

/**
 * Fetch all historical offers from the Supabase Database
 */
export async function fetchOffersFromSupabase(): Promise<OfferHit[]> {
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .select("*")
      .order("scanned_at", { ascending: false });

    if (error) {
      console.error("Error fetching from Supabase table:", error);
      throw error;
    }

    if (data) {
      return data.map(toOfferHit);
    }
  } catch (err) {
    console.error("Database connection failure:", err);
  }
  return [];
}

/**
 * Insert or Update multiple offer hits inside Supabase database in batch (id is key)
 */
export async function batchUpsertOffersToSupabase(hits: OfferHit[]): Promise<SupabaseSyncResult> {
  if (!isSupabaseConfigured || !supabase || hits.length === 0) {
    return { success: false, error: "Supabase client not configured" };
  }

  try {
    const rows = hits.map(toSupabaseRow);
    const { error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .upsert(rows, { onConflict: "id" });

    if (error) {
      console.error("Batch upsert to Supabase error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, count: hits.length };
  } catch (err: any) {
    console.error("Supabase communication crash:", err);
    return { success: false, error: err.message || JSON.stringify(err) };
  }
}

/**
 * Save / Update a single offer to Supabase
 */
export async function upsertOfferToSupabase(hit: OfferHit): Promise<SupabaseSyncResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase client not configured" };
  }

  try {
    const row = toSupabaseRow(hit);
    const { error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .upsert(row, { onConflict: "id" });

    if (error) {
      console.error("Upsert to Supabase error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Supabase communication error:", err);
    return { success: false, error: err.message || JSON.stringify(err) };
  }
}

/**
 * Clear all records in Supabase
 */
export async function clearAllFromSupabase(): Promise<SupabaseSyncResult> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: "Supabase client not configured" };
  }

  try {
    const { error } = await supabase
      .from(SUPABASE_TABLE_NAME)
      .delete()
      .neq("id", "0"); // Delete all

    if (error) {
      console.error("Delete all records error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Supabase delete action failed:", err);
    return { success: false, error: err.message || JSON.stringify(err) };
  }
}
