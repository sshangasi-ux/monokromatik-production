import { ExternalLink, Film, ImageIcon } from 'lucide-react';
import MediaImage from './MediaImage';

export interface AttributedImageAsset {
  src: string;
  alt: string;
  caption: string;
  credit: string;
  sourceLabel: string;
  sourceHref: string;
}

export function AttributedImage({ asset, feature = false }: { asset: AttributedImageAsset; feature?: boolean }) {
  return (
    <figure className="my-10 bg-mono-soft-white border border-mono-gray/20 overflow-hidden">
      <div className={`relative bg-mono-charcoal overflow-hidden ${feature ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}>
        <MediaImage fill duotone={false} zoomOnHover={false} src={asset.src} alt={asset.alt} />
      </div>
      <figcaption className="p-5 md:p-6">
        <div className="flex items-start gap-3">
          <ImageIcon size={17} className="text-mono-amber shrink-0 mt-1" />
          <div>
            <p className="text-sm font-body text-mono-charcoal leading-relaxed">{asset.caption}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] tracking-[0.16em] font-display font-bold text-mono-gray">
              <span>CREDIT: {asset.credit}</span>
              <a href={asset.sourceHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-mono-amber-strong hover:text-mono-amber-hover hover:underline">SOURCE: {asset.sourceLabel} <ExternalLink size={11} /></a>
            </div>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

export function AttributedImagePair({ assets }: { assets: AttributedImageAsset[] }) {
  return (
    <div className="my-10 grid md:grid-cols-2 gap-4">
      {assets.map((asset) => <AttributedImage key={asset.src} asset={asset} />)}
    </div>
  );
}

export function OfficialVideoEmbed({ youtubeId, title, caption, credit, sourceHref, sourceLabel }: { youtubeId: string; title: string; caption: string; credit: string; sourceHref: string; sourceLabel: string }) {
  return (
    <figure className="my-10 bg-mono-black text-mono-white overflow-hidden">
      <div className="aspect-video bg-mono-charcoal">
        <iframe
          className="w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
      <figcaption className="p-5 md:p-6 flex items-start gap-3">
        <Film size={18} className="text-mono-amber shrink-0 mt-1" />
        <div>
          <p className="text-sm font-body text-mono-soft-white leading-relaxed">{caption}</p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] tracking-[0.16em] font-display font-bold text-mono-gray">
            <span>CREDIT: {credit}</span>
            <a href={sourceHref} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-mono-amber hover:underline">OFFICIAL SOURCE: {sourceLabel} <ExternalLink size={11} /></a>
          </div>
        </div>
      </figcaption>
    </figure>
  );
}

export function MediaStatus({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-9 border-l-4 border-mono-amber bg-mono-soft-white p-5 md:p-6">
      <p className="text-[10px] tracking-[0.24em] font-display font-bold text-mono-amber mb-3">MEDIA USE NOTE</p>
      <div className="text-sm text-mono-charcoal font-body leading-relaxed">{children}</div>
    </div>
  );
}
