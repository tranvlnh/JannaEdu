import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

// Bypasses RLS. Server only: SUPABASE_SECRET_KEY has no NEXT_PUBLIC_ prefix, so it never reaches the browser.
export const createAdminClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
