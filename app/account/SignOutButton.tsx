'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '../../lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const signOut = async () => {
    await createClient().auth.signOut();
    router.refresh();
  };
  return (
    <button onClick={signOut} className="inline-flex items-center gap-2 border border-mono-black text-mono-black px-6 py-3 font-display font-bold hover:bg-mono-soft-white transition-colors">
      SIGN OUT
    </button>
  );
}
