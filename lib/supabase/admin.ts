import { createClient } from '@supabase/supabase-js';

// Service-role Supabase client — SERVER ONLY (never import into client code).
// Bypasses RLS; used by the Paystack webhook to write entitlements. Returns null
// if the service-role key isn't configured, so callers fail gracefully.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
