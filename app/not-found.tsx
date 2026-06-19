import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mono-white flex items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <div className="text-9xl font-display font-bold text-mono-amber mb-6">404</div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-mono-black mb-6">
          EISH! THIS PAGE GOT LOST
        </h1>
        <p className="text-xl text-mono-gray font-body mb-8">
          Looks like this link took a wrong turn somewhere between Lagos and Jozi.
        </p>
        
        <div className="bg-mono-soft-white p-8 mb-8">
          <p className="font-display font-bold text-mono-black mb-4">While we find it, check out:</p>
          <ul className="space-y-2 font-body text-mono-charcoal">
            <li>• Today's top story: Burna Boy's secret collaboration drops Friday</li>
            <li>• Trending: #AfrobeatsMagic</li>
            <li>• Popular: PSL playoff analysis</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="px-8 py-4 bg-mono-amber text-mono-black font-display font-bold text-lg hover:bg-mono-amber/90 transition-colors">
            TAKE ME HOME
          </Link>
          <Link href="/pulse" className="px-8 py-4 border-2 border-mono-charcoal text-mono-black font-display font-bold text-lg hover:border-mono-amber hover:text-mono-amber transition-colors">
            EXPLORE TRENDING
          </Link>
        </div>
      </div>
    </div>
  );
}
