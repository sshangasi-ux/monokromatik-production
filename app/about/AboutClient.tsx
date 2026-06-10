'use client';

import Link from 'next/link';
import { Code, CheckCircle2, Clock, Target } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-mono-white">
      <Navigation />

      {/* Hero */}
      <section className="py-20 bg-mono-black text-mono-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Built For The <span className="text-mono-amber">Diaspora</span>
          </h1>
          <p className="text-xl text-mono-soft-white font-body">
            Zero budget. One person. Claude AI. A mission to connect 1.4 billion Africans + diaspora worldwide.
          </p>
        </div>
      </section>

      {/* Founding Story */}
      <section className="py-16 bg-mono-soft-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black mb-8">
            How MonoKromatik Started
          </h2>

          <div className="space-y-6 font-body text-mono-charcoal text-xl leading-relaxed">
            <p>
              I&apos;m a South African techie who got tired of scrolling past the same 5 African stories on global news sites.
              Where was the PSL drama? The Afrobeats behind-the-scenes? The diaspora success stories?
            </p>

            <p>
              So I built MonoKromatik Network — an AI-powered platform covering African culture, sports, and entertainment
              from an insider&apos;s lens. Zero budget. One person. Claude API. And a mission to connect 1.4 billion Africans
              + diaspora worldwide.
            </p>

            <p>
              This isn&apos;t another &quot;African poverty&quot; narrative. This is vibrancy, innovation, excellence — in black and white
              with burnt amber accents. <span className="font-display font-bold text-mono-amber-strong">Monochrome meets chromatic. MonoKromatik.</span>
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-mono-amber mb-2">$0</div>
              <div className="text-mono-gray font-body">Starting Budget</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-mono-amber mb-2">1</div>
              <div className="text-mono-gray font-body">Person Team</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-mono-amber mb-2">1.4B</div>
              <div className="text-mono-gray font-body">Target Audience</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-mono-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black mb-12 text-center">
            How We Work — <span className="text-mono-amber">100% Transparent</span>
          </h2>

          <div className="space-y-8">
            {[
              {
                num: 1,
                title: 'DISCOVER',
                desc: 'Our Scout agent monitors 20+ African RSS sources every hour — OkayAfrica, BellaNaija, NotJustOk, KickOff, SA Hip Hop Mag, Punch Nigeria, and more across culture, sports, music.',
              },
              {
                num: 2,
                title: 'CURATE',
                desc: 'Our Curator agent uses Claude to score every story by diaspora relevance. Filters out poverty porn, conflict, and generic news. Keeps the celebratory, the cultural, the surprising.',
              },
              {
                num: 3,
                title: 'CRAFT',
                desc: 'Our Writer agent uses Claude to draft 1,000-word articles in MonoKromatik voice — energetic, insider, never academic. Each article connects the story back to diaspora experience.',
              },
              {
                num: 4,
                title: 'PUBLISH',
                desc: 'Articles auto-commit to GitHub, Vercel deploys in ~2 minutes, and the new story is live. Daily, at 6 AM SAST. While you sleep, the newsroom runs.',
              },
            ].map((step) => (
              <div key={step.num} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-mono-amber text-mono-white rounded-full flex items-center justify-center font-display font-bold text-xl">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-mono-black mb-2">{step.title}</h3>
                  <p className="text-mono-charcoal font-body">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tech Stack */}
          <div className="mt-12 p-8 bg-mono-black text-mono-white">
            <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
              <Code className="text-mono-amber" size={28} />
              <span>OUR TECH STACK</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 font-body">
              {[
                { label: 'Frontend', value: 'Next.js 16' },
                { label: 'AI Engine', value: 'Claude API' },
                { label: 'Content', value: 'Git + JSON' },
                { label: 'Hosting', value: 'Vercel' },
                { label: 'Scheduler', value: 'GitHub Actions' },
                { label: 'Newsletter', value: 'ConvertKit' },
                { label: 'Analytics', value: 'Google Analytics 4' },
                { label: 'Cost', value: '~$15/month' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-mono-amber-strong font-bold mb-1">{item.label}</div>
                  <div className="text-mono-gray text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Code */}
      <section id="code" className="py-16 bg-mono-soft-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-black mb-4 text-center">
            Our <span className="text-mono-amber">Code</span>
          </h2>
          <p className="text-center text-mono-gray font-body mb-12 text-lg">
            The 10 principles that guide everything we create
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { num: 1, title: 'Publish Daily', desc: 'Consistency over perfection. Ship it.' },
              { num: 2, title: 'Credit Sources Always', desc: 'Integrity matters. Link back, tag creators.' },
              { num: 3, title: 'Celebrate Africa', desc: 'No poverty porn. Excellence, innovation, culture.' },
              { num: 4, title: 'Be Transparent', desc: 'Show AI usage openly. Trust through honesty.' },
              { num: 5, title: 'Engage Community', desc: 'Reply to every comment within 24 hours.' },
              { num: 6, title: 'Measure Everything', desc: 'Data-driven decisions only. Track, analyze, adapt.' },
              { num: 7, title: "Kill What Doesn't Work", desc: 'Ruthless prioritization. No sacred cows.' },
              { num: 8, title: 'Learn In Public', desc: 'Document the journey. Vulnerability builds trust.' },
              { num: 9, title: 'Serve Diaspora First', desc: 'Their stories, their lens, their connection.' },
              { num: 10, title: 'Build For Scale', desc: 'Automation over manual labor. Think 10x.' },
            ].map((item) => (
              <div key={item.num} className="p-6 border-2 border-mono-charcoal hover:border-mono-amber transition-colors">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-mono-amber text-mono-white rounded-full flex items-center justify-center font-display font-bold">
                    {item.num}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-mono-black mb-2">{item.title}</h3>
                    <p className="text-mono-gray font-body text-sm">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building In Public */}
      <section className="py-16 bg-mono-amber">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-mono-white mb-12 text-center">
            Building In Public
          </h2>

          <div className="space-y-4">
            {[
              { icon: CheckCircle2, title: 'Daily Content', desc: 'Publishing 1+ articles per day', status: 'DONE ✓', done: true },
              { icon: CheckCircle2, title: 'Agent Pipeline', desc: 'Scout → Curator → Writer → Publisher', status: 'DONE ✓', done: true },
              { icon: CheckCircle2, title: 'All 8 Category Pages', desc: 'Pulse, Roots, Arena, Waves, Watch, Listen, Shop, About', status: 'DONE ✓', done: true },
              { icon: Clock, title: 'Auto-Publish 6 AM SAST', desc: 'GitHub Actions schedules daily run', status: 'LIVE', done: true },
              { icon: Target, title: 'Photo Galleries', desc: 'Visual storytelling features', status: 'MAY 2026', done: false },
              { icon: Target, title: 'Live Sports Scores', desc: 'Real-time PSL & CAF updates', status: 'JUNE 2026', done: false },
              { icon: Target, title: 'Community Features', desc: 'Comments, forums, user profiles', status: 'JULY 2026', done: false },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="flex items-center gap-4 p-4 bg-mono-white/10 backdrop-blur-sm border border-mono-white/20">
                  <Icon className="text-mono-white flex-shrink-0" size={24} />
                  <div className="flex-1">
                    <div className="font-display font-bold text-mono-white">{item.title}</div>
                    <div className="text-mono-white/70 font-body text-sm">{item.desc}</div>
                  </div>
                  <div className="text-mono-white font-display font-bold">{item.status}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
