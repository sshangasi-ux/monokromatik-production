# Monokromatik 2.0 — Foundation Implementation Pack

## Status

This package prepares **Phase 1: visual and editorial foundation** against the existing `sshangasi-ux/monokromatik-production` application.

It is designed for a GitHub feature branch named:

`feature/monokromatik-2-foundation`

No production deployment should happen until the revised experience has been previewed and approved.

## What this pack contains

### Documentation
- `docs/MONOKROMATIK_2_PRODUCT_BLUEPRINT.md`
- `docs/AI_ORCHESTRATION_ARCHITECTURE.md`
- `docs/EDITORIAL_GOVERNANCE.md`
- `docs/SOURCE_AND_RIGHTS_POLICY.md`

### Proposed code files
- `app/components/Navigation.tsx` — revised navigation and trust-led AI positioning
- `app/components/NewsletterSignup.tsx` — evolves The Pulse signup into The Weekly Signal
- `app/page.tsx` — revised content-rich homepage foundation
- `app/signal/page.tsx` — new Signal vertical landing page
- `app/intelligence/page.tsx` — new Intelligence product preview page
- `app/editorial-standards/page.tsx` — public trust page foundation
- `app/ai-methodology/page.tsx` — public AI-governance page foundation

## Implementation boundary

This package intentionally does **not**:
- Merge or deploy changes.
- Modify current scheduled agents.
- Add API credentials.
- Add Supabase.
- Add OpenAI runtime dependencies yet.
- Auto-publish any Signal/intelligence content.
- Change the current image pipeline in production.

Those actions belong to Phase 2/3 after UI preview approval.

## Working method

All foundation work must remain on the feature branch until reviewed in a Vercel preview and explicitly approved for merging.