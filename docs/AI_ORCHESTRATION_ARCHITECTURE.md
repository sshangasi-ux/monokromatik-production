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