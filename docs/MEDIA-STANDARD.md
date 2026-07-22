# Media standard — specific, factual, true to the topic

**The rule: every image must be about the story it sits on.** Not adjacent to it,
not evocative of its theme — about it. A photograph of the actual person, brand,
event or place, traceable to a source that establishes what it is. Generic stock
imagery is never acceptable, on any edition or any piece.

This is not a style preference. For a publication whose whole claim is that it
deals in verified specifics, a decorative stock photo undercuts the argument on
sight. If the picture is generic, the reader has one good reason to suspect the
words are too.

---

## How images are sourced

Topical, not generic, by construction:

- **Every piece carries a `sourceLink`** — the original reporting it is built on.
- **`scripts/refresh-images.ts` hotlinks the hero from that source page**, scoring
  each candidate against the piece's own title and slug, and actively downgrading
  images a publication reuses across unrelated stories.
- **Provenance travels with the image**: a credit and a source URL, so anyone can
  check where it came from. 119 of 120 articles carry both today.

The one honest exception: **no image is a valid editorial choice.** If a
verifiable, topical picture cannot be found, the piece runs without one. A card
with no image is fine; the renderer guards on `imageUrl` and simply omits it. A
card with a false image is not.

---

## The gate — `npm run media:relevance`

Sourcing well is a preference; this is the guarantee. It runs in CI and blocks a
merge that would ship imagery that isn't true to the topic. Three hard failures:

| Class | What it catches | Why it's certain |
|---|---|---|
| **STOCK** | Pexels, Unsplash, Shutterstock, iStock, Pixabay, Adobe Stock, Canva, placeholders | Stock libraries exist to be reused across unrelated topics — the definition of generic |
| **ORPHAN** | An image with no credit, no source URL, and no topic token in its filename or alt | If we cannot establish what it is, we do not publish it as though it were the story |
| **REUSE** | The same image on two *unrelated* pieces | The single strongest signal of generic filler |

And one advisory:

| **OPAQUE** | An owned asset with provenance but a topic-less filename (e.g. a CMS number) | Probably fine — it is traceable — but a human should confirm it is the right picture |

**REUSE is deliberately narrow.** An article and its companion case study on the
*same* event sharing the definitive image of that event is correct, not generic —
that is precisely what we want. The check only fails reuse across pieces that
share no meaningful topic token.

Run it locally before adding media:

```bash
npm run media:relevance
```

Failures exit non-zero. `MEDIA_STRICT=false` reports without failing, for triage.

---

## The standing intent for every edition

The gate is the floor, not the ambition. For each edition and every piece, the
sourcing brief is the same: **scrub the actual reporting for the most current,
most specific, most factual image of the real subject** — the real match, the
real signing, the real designer, the real venue — and use that. When the source
page is bot-blocked or paywalled (some outlets 403 automated fetches), the image
is sourced by hand from the reporting, not substituted with something generic.

When in doubt, the order of preference is:

1. The real, specific, credited image of the actual subject.
2. No image.
3. — there is no third option. A generic image is never the answer.
