import { createClient, isSupabaseConfigured } from './supabase/server';

export interface Entitlement {
  status: string; // active | inactive | cancelled
  tier: string | null; // individual | team
  current_period_end: string | null;
}

/** The signed-in user's entitlement row (via RLS), or null. Never throws. */
export async function getEntitlement(): Promise<Entitlement | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;
    const { data } = await supabase
      .from('entitlements')
      .select('status,tier,current_period_end')
      .eq('email', user.email)
      .maybeSingle();
    return (data as Entitlement) ?? null;
  } catch {
    return null;
  }
}

/** True when an entitlement is active and unexpired. */
export function entitlementActive(e: Entitlement | null): boolean {
  if (!e || e.status !== 'active') return false;
  if (!e.current_period_end) return true;
  return new Date(e.current_period_end) > new Date();
}

export async function isMember(): Promise<boolean> {
  return entitlementActive(await getEntitlement());
}
