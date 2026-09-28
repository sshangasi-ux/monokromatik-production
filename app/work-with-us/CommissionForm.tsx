'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { CONTACT_EMAIL, SERVICES } from '../../lib/commerce';

// Lead capture, wired. Submits to POST /api/lead, which records the enquiry to
// Supabase (public.leads) and emails the team via Resend. No more mailto black
// hole — the previous version opened the visitor's mail client and captured
// nothing, silently failing on mobile/webmail. A mailto fallback is offered
// only if the API call fails, so a high-intent lead is never lost.
export default function CommissionForm({
  defaultInterest = 'scorecard',
  source = 'work-with-us',
}: {
  defaultInterest?: string;
  source?: string;
}) {
  const [interest, setInterest] = useState(defaultInterest);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interest, name, company, email, message, source }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(data?.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please try again.');
    }
  };

  const field = 'w-full bg-mono-white border border-mono-gray/30 px-4 py-3 font-body text-mono-black placeholder:text-mono-gray focus:border-mono-amber focus:outline-none';
  const label = 'block text-[11px] tracking-[0.18em] font-display font-bold text-mono-gray mb-2';

  if (status === 'success') {
    return (
      <div className="flex flex-col items-start gap-4 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-mono-amber/15 text-mono-amber-strong">
          <Check size={24} aria-hidden="true" />
        </div>
        <h3 className="text-2xl font-display font-bold text-mono-black leading-tight">Brief received.</h3>
        <p className="font-body text-mono-charcoal leading-relaxed">
          Thanks{name ? `, ${name.split(' ')[0]}` : ''}. We&rsquo;ve logged your enquiry and it&rsquo;s in our inbox — we&rsquo;ll reply
          from <span className="text-mono-black font-semibold">{CONTACT_EMAIL}</span>, usually within one working day.
        </p>
      </div>
    );
  }

  const service = SERVICES.find((s) => s.id === interest)?.title ?? interest;
  const mailtoFallback = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Commission enquiry — ${service}`)}&body=${encodeURIComponent(
    [`Service: ${service}`, `Name: ${name}`, `Company: ${company}`, `Email: ${email}`, '', message].join('\n'),
  )}`;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label htmlFor="interest" className={label}>WHAT YOU NEED</label>
        <select id="interest" value={interest} onChange={(e) => setInterest(e.target.value)} className={field}>
          {SERVICES.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className={label}>NAME</label>
          <input id="name" required value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="company" className={label}>COMPANY</label>
          <input id="company" value={company} onChange={(e) => setCompany(e.target.value)} className={field} placeholder="Brand / agency" />
        </div>
      </div>
      <div>
        <label htmlFor="email" className={label}>EMAIL</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={field} placeholder="you@company.com" />
      </div>
      <div>
        <label htmlFor="message" className={label}>WHAT ARE YOU AFTER?</label>
        <textarea id="message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className={field} placeholder="The brand, campaign or market you want decoded…" />
      </div>

      {status === 'error' && (
        <p className="font-body text-sm text-mono-charcoal bg-mono-amber/10 border border-mono-amber/30 px-4 py-3">
          {errorMsg} You can also{' '}
          <a href={mailtoFallback} className="text-mono-amber-strong font-semibold underline">email us directly</a>.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-8 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'SENDING…' : 'START THE BRIEF'}
        {status !== 'submitting' && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
