import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/server';

// Auth callback for BOTH sign-in link shapes, then redirect to `next` (default
// /account):
//   • OAuth / PKCE      → ?code=...              → exchangeCodeForSession
//   • Email magic link  → ?token_hash=…&type=…   → verifyOtp
// Supabase's email links deliver a token_hash (not a code), so a code-only
// callback silently fails to establish the session and bounces to sign-in.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? '/account';

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
      if (!error) return NextResponse.redirect(`${origin}${next}`);
    }
  }
  return NextResponse.redirect(`${origin}/account?error=auth`);
}
