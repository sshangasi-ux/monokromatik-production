'use client';

import { Twitter, Facebook, Linkedin, Share2 } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url: string;
  variant?: 'horizontal' | 'vertical' | 'floating';
}

export default function SocialShare({ title, url, variant = 'horizontal' }: SocialShareProps) {
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = async (platform: string) => {
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      window.open(shareLinks[platform as keyof typeof shareLinks], '_blank', 'width=600,height=400');
    }
  };

  if (variant === 'floating') {
    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-10">
        <button
          onClick={() => handleShare('twitter')}
          className="p-3 bg-mono-white hover:bg-mono-amber text-mono-black hover:text-mono-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Share on Twitter"
        >
          <Twitter className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-3 bg-mono-white hover:bg-green-500 text-mono-black hover:text-mono-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Share on WhatsApp"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="p-3 bg-mono-white hover:bg-blue-600 text-mono-black hover:text-mono-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Share on Facebook"
        >
          <Facebook className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="p-3 bg-mono-white hover:bg-blue-700 text-mono-black hover:text-mono-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="w-5 h-5" />
        </button>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-mono-gray font-body text-sm font-bold mb-2">SHARE THIS STORY</p>
        <button
          onClick={() => handleShare('twitter')}
          className="flex items-center gap-3 p-3 hover:bg-mono-soft-white rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-mono-black text-mono-white rounded">
            <Twitter className="w-4 h-4" />
          </div>
          <span className="font-body text-mono-charcoal">Share on Twitter</span>
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-3 p-3 hover:bg-mono-soft-white rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-green-500 text-mono-white rounded">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </div>
          <span className="font-body text-mono-charcoal">Share on WhatsApp</span>
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-3 p-3 hover:bg-mono-soft-white rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-blue-600 text-mono-white rounded">
            <Facebook className="w-4 h-4" />
          </div>
          <span className="font-body text-mono-charcoal">Share on Facebook</span>
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-3 p-3 hover:bg-mono-soft-white rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-blue-700 text-mono-white rounded">
            <Linkedin className="w-4 h-4" />
          </div>
          <span className="font-body text-mono-charcoal">Share on LinkedIn</span>
        </button>
      </div>
    );
  }

  // Default horizontal variant
  return (
    <div className="flex items-center gap-4 flex-wrap">
      <span className="text-mono-gray font-body text-sm font-bold">SHARE:</span>
      <button
        onClick={() => handleShare('twitter')}
        className="flex items-center gap-2 px-4 py-2 bg-mono-black hover:bg-mono-amber text-mono-white rounded-lg transition-colors"
      >
        <Twitter className="w-4 h-4" />
        <span className="font-body text-sm">Twitter</span>
      </button>
      <button
        onClick={() => handleShare('whatsapp')}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-mono-white rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span className="font-body text-sm">WhatsApp</span>
      </button>
      <button
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-mono-white rounded-lg transition-colors"
      >
        <Facebook className="w-4 h-4" />
        <span className="font-body text-sm">Facebook</span>
      </button>
      <button
        onClick={() => handleShare('linkedin')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-mono-white rounded-lg transition-colors"
      >
        <Linkedin className="w-4 h-4" />
        <span className="font-body text-sm">LinkedIn</span>
      </button>
      {navigator.share && (
        <button
          onClick={() => handleShare('native')}
          className="flex items-center gap-2 px-4 py-2 bg-mono-soft-white hover:bg-mono-gray text-mono-charcoal rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span className="font-body text-sm">More</span>
        </button>
      )}
    </div>
  );
}
