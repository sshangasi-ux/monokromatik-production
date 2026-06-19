'use client';

// Inline SVG icon components — avoids version drift in lucide-react
function TwitterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function FacebookIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" />
    </svg>
  );
}
function LinkedInIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}
function ShareIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

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
    if (platform === 'native' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
    } else {
      window.open(
        shareLinks[platform as keyof typeof shareLinks],
        '_blank',
        'width=600,height=400'
      );
    }
  };

  if (variant === 'floating') {
    return (
      <div className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-10">
        <button
          onClick={() => handleShare('twitter')}
          className="p-3 bg-mono-white hover:bg-mono-amber text-mono-black hover:text-mono-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Share on X / Twitter"
        >
          <TwitterIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="p-3 bg-mono-white hover:bg-green-500 text-mono-black hover:text-mono-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Share on WhatsApp"
        >
          <WhatsAppIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="p-3 bg-mono-white hover:bg-blue-600 text-mono-black hover:text-mono-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Share on Facebook"
        >
          <FacebookIcon className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="p-3 bg-mono-white hover:bg-blue-700 text-mono-black hover:text-mono-white rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          aria-label="Share on LinkedIn"
        >
          <LinkedInIcon className="w-5 h-5" />
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
            <TwitterIcon className="w-4 h-4" />
          </div>
          <span className="font-body text-mono-charcoal">Share on X / Twitter</span>
        </button>
        <button
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-3 p-3 hover:bg-mono-soft-white rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-green-500 text-mono-white rounded">
            <WhatsAppIcon className="w-4 h-4" />
          </div>
          <span className="font-body text-mono-charcoal">Share on WhatsApp</span>
        </button>
        <button
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-3 p-3 hover:bg-mono-soft-white rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-blue-600 text-mono-white rounded">
            <FacebookIcon className="w-4 h-4" />
          </div>
          <span className="font-body text-mono-charcoal">Share on Facebook</span>
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-3 p-3 hover:bg-mono-soft-white rounded-lg transition-colors text-left"
        >
          <div className="p-2 bg-blue-700 text-mono-white rounded">
            <LinkedInIcon className="w-4 h-4" />
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
        className="flex items-center gap-2 px-4 py-2 bg-mono-black hover:bg-mono-amber text-mono-black rounded-lg transition-colors"
      >
        <TwitterIcon className="w-4 h-4" />
        <span className="font-body text-sm">X / Twitter</span>
      </button>
      <button
        onClick={() => handleShare('whatsapp')}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-mono-white rounded-lg transition-colors"
      >
        <WhatsAppIcon className="w-4 h-4" />
        <span className="font-body text-sm">WhatsApp</span>
      </button>
      <button
        onClick={() => handleShare('facebook')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-mono-white rounded-lg transition-colors"
      >
        <FacebookIcon className="w-4 h-4" />
        <span className="font-body text-sm">Facebook</span>
      </button>
      <button
        onClick={() => handleShare('linkedin')}
        className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-mono-white rounded-lg transition-colors"
      >
        <LinkedInIcon className="w-4 h-4" />
        <span className="font-body text-sm">LinkedIn</span>
      </button>
      {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
        <button
          onClick={() => handleShare('native')}
          className="flex items-center gap-2 px-4 py-2 bg-mono-soft-white hover:bg-mono-gray text-mono-charcoal rounded-lg transition-colors"
        >
          <ShareIcon className="w-4 h-4" />
          <span className="font-body text-sm">More</span>
        </button>
      )}
    </div>
  );
}
