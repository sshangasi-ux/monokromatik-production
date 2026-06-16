# AI Orchestration Architecture

## Operating principle

AI is the operating advantage, not the public value proposition. Monokromatik wins through African insight, reliable sourcing, editorial judgment and useful intelligence.

## Required provider model

Build a shared provider abstraction layer:

```text
Monokromatik AI Router
├── task registry
├── prompt and schema registry
├── Anthropic / Claude adapter
├── OpenAI adapter
├── validation and repair
├── failover router
├── quality scoring
├── cost and usage logs
└── audit trail
```

## Claude → OpenAI fallback policy

When Claude is primary, OpenAI must automatically be invoked after:
- timeout;
- rate limiting or provider API failure;
- empty completion;
- invalid structured output after repair/retry;
- failed task-quality validation.

Failover flow:

```text
Task → Claude → Validate
          ├── Pass: continue
          └── Fail: retry where appropriate → OpenAI → Validate
                                                ├── Pass: continue and log failover
                                                └── Fail: queue, alert, do not publish
```

No AI fallback bypasses copyright, safety, rights, editorial or human-approval requirements.

## Task-level operating model

| Task | Autonomy | Approval rule |
|---|---|---|
| Source discovery | Fully automated | None |
| Metadata extraction | Automated with validation | Audit samples |
| Duplicate detection | Fully automated | None |
| Relevance scoring | Fully automated | None |
| Source verification pack | Automated draft | Required for Signal publication |
| Cultural editorial draft | Automated | Risk-tier dependent |
| Signal case-study draft | Automated | Human approval mandatory |
| Brand Read (strategic layer) | Automated draft, double-gated | Human approval mandatory (PR sign-off) |
| Newsletter draft | Automated | Review initially |
| Social derivatives of approved content | Automated | Template governance |
| Reader Q&A from verified intelligence | Automated and cited | Audit |
| Image-rights decision | Flag only | Human decision |
| Production code/self-deployment | Never autonomous | Human control |

## Self-learning system

The platform may learn from:
- approved and rejected pitches;
- source reliability outcomes;
- corrections;
- engagement and reading depth;
- newsletter behaviour;
- search activity;
- model success/failure;
- content costs;
- rights-risk flags.

The platform may autonomously optimise:
- source rankings;
- story-priority scoring;
- model routing;
- recommendation ranking;
- controlled prompt variants;
- duplicate-detection thresholds.

The platform may never autonomously alter:
- editorial values;
- rights policies;
- approval gates;
- legal/compliance rules;
- production code;
- disclosure policy;
- paid pricing or commercial claims.

## The Brand Read pipeline stage (Strategist + Brand Read Editor)

The Brand Read is the dual-read strategic layer that turns a culture story
into intelligence for decision makers (see `docs/MONOKROMATIK_EDITORIAL_VOICE.md`
— "The dual read"). It is produced by a two-agent stage that runs **only on
EIC-approved articles**, positioned between the Editor-in-Chief gate and the
Publisher:

```text
… → Editor-in-Chief (approve/kill) → [Strategist → Brand Read Editor] → Publisher
```

- **Strategist** (`lib/strategist.ts`) writes the Brand Read in the house
  voice, leading with a stance ("Our take is that…"), attributed to the
  masthead ("The MonoKromatik Team / Brand Intelligence"), with dual-layer
  takeaways pairing an insight ("where this lands") to a concrete move ("what
  to do with it"). It reads `lib/voice-profile.md` (how it writes) and
  `lib/perspectives-our-take.md` (the standing strategic positions) as cached
  context.
- **Brand Read Editor** (`lib/brand-read-editor.ts`) then scores the produced
  read on five dimensions — grounding, strategic value, voice fit, takeaway
  actionability, conviction — and decides keep/drop against version-controlled
  thresholds (`applyBrandReadGate`). Grounding is the hard gate: a suspected
  invented statistic, campaign, or quote drops the read.

Both agents are **FAIL-CLOSED** and purely **additive**. If either declines,
errors, or scores below the bar, no `brandRead` is attached and the article
publishes exactly as it would have without the layer. The asymmetry is
deliberate: a missing Brand Read is a non-event, while a weak or ungrounded
one is a reputational and monetisation failure — and the dual-layer takeaway
is precisely the output intended for paid intelligence. The guard is at least
as conservative as the thing it guards.

This is a deliberate contrast with the Editor-in-Chief, which is FAIL-OPEN
(an article still ships if the EIC errors, because editorial review should
never take the pipeline down). The Brand Read inverts that default because
the cost of a bad strategic claim is borne by the brand, not just the piece.

Under today's governance the attached Brand Read lands in the Publisher's PR
diff for operator sign-off (the `--stage` path); it does not auto-publish.
The route to fuller autonomy is to raise trust incrementally, always inside
the review gate. A future source/fact-verification tool (e.g. a search or
news connector) can slot into the Editor as an optional evidence step,
letting confidence rise above `interpretive` on a checkable basis rather than
by assertion.