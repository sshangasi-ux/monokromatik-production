'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

// Passwordless magic-link sign-in. Supabase emails a link to /auth/callback,
// which exchanges the code for a session.
export default function SignIn() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/account` },
      });
      if (error) throw error;
      setStatus('sent');
      setMessage('Check your inbox for a sign-in link.');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Something went wrong — try again.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="border border-mono-gray/25 bg-mono-soft-white p-6 text-center">
        <p className="font-display font-bold text-mono-black">✓ Link sent</p>
        <p className="mt-2 font-body text-mono-charcoal text-sm">{message} Click it to finish signing in to <span className="font-bold">{email}</span>.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-[11px] tracking-[0.18em] font-display font-bold text-mono-gray mb-2">EMAIL</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="w-full bg-mono-white border border-mono-gray/30 px-4 py-3 font-body text-mono-black placeholder:text-mono-gray focus:border-mono-amber focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-7 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors disabled:opacity-60"
      >
        {status === 'loading' ? 'SENDING…' : 'EMAIL ME A LINK'} <ArrowRight size={18} />
      </button>
      {status === 'error' && <p className="text-mono-amber-strong font-body text-sm" role="alert">{message}</p>}
    </form>
  );
}
