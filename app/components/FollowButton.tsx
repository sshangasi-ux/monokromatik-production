'use client';

import { Star } from 'lucide-react';
import { useFollowedBrands } from './useFollowedBrands';

/**
 * Follow / unfollow a brand on the Cultural-Signal Index. `chip` = a labelled
 * pill (brand page); `icon` = a compact star (leaderboard rows).
 */
export default function FollowButton({
  slug,
  variant = 'chip',
  onToggle,
}: {
  slug: string;
  variant?: 'chip' | 'icon';
  onToggle?: () => void;
}) {
  const { has, toggle, ready } = useFollowedBrands();
  const following = ready && has(slug);

  const handle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(slug);
    onToggle?.();
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handle}
        aria-pressed={following}
        aria-label={following ? 'Unfollow brand' : 'Follow brand'}
        title={following ? 'Following' : 'Follow'}
        className={`p-1.5 transition-colors ${following ? 'text-mono-amber-strong' : 'text-mono-gray hover:text-mono-amber-strong'}`}
      >
        <Star size={16} className={following ? 'fill-current' : ''} />
      </button>
    );
  }

  return (
    <button
      onClick={handle}
      aria-pressed={following}
      className={`inline-flex items-center gap-2 px-5 py-3 font-display font-bold text-sm tracking-[0.06em] border transition-colors ${
        following
          ? 'bg-mono-amber text-mono-black border-mono-amber'
          : 'bg-transparent text-mono-white border-mono-white/40 hover:border-mono-amber hover:text-mono-amber'
      }`}
    >
      <Star size={16} className={following ? 'fill-current' : ''} />
      {following ? 'FOLLOWING' : 'FOLLOW THIS BRAND'}
    </button>
  );
}
