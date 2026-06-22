'use client';

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CONTACT_EMAIL, SERVICES } from '../../lib/commerce';

// Lead capture without backend infrastructure: the form composes a pre-filled
// email to CONTACT_EMAIL and opens the visitor's mail client on submit. Honest,
// instant, and zero dependency — swap for a POST /api/lead when an inbox/CRM is wired.
export default function CommissionForm({ defaultInterest = 'scorecard' }: { defaultInterest?: string }) {
  const [interest, setInterest] = useState(defaultInterest);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const service = SERVICES.find((s) => s.id === interest)?.title ?? interest;
    const subject = `Commission enquiry — ${service}`;
    const body = [
      `Service: ${service}`,
      `Name: ${name}`,
      `Company: ${company}`,
      `Email: ${email}`,
      '',
      message,
    ].join('\n');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const field = 'w-full bg-mono-white border border-mono-gray/30 px-4 py-3 font-body text-mono-black placeholder:text-mono-gray focus:border-mono-amber focus:outline-none';
  const label = 'block text-[11px] tracking-[0.18em] font-display font-bold text-mono-gray mb-2';

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
      <button type="submit" className="inline-flex items-center gap-2 bg-mono-black text-mono-white px-8 py-4 font-display font-bold hover:bg-mono-charcoal transition-colors">
        START THE BRIEF <ArrowRight size={18} />
      </button>
    </form>
  );
}
