# The MonoKromatik Capability System

*A living, self-improving skill base for the Intelligence Services offering — so the
capability to deliver an ask is never behind the ask.*

The principle, from today: **every offering is backed by a named capability, every
capability is continuously learning, and the gaps learn fastest.** We do not wait to be
asked for a skill before building it. The same way we run intelligence on markets, we run
intelligence on our own ability to deliver — picking up current, market-specific method
and staying a step ahead of what the asks require.

This system has three parts: a **matrix** (what we need and how mature it is), a **learning
loop** (how it keeps advancing), and an **operating rule** (how it bakes into delivery).

---

## 1. The capability matrix

Every service maps to the capabilities it needs. Each capability carries a **maturity
(0–4)**, an **owner**, a **learning cadence**, and **sources** it learns from. Maturity:

- **0 — Absent.** Not held; would have to be bought in ad hoc.
- **1 — Notional.** A plan/network, not a delivered skill.
- **2 — Founder-level.** Deliverable by the principal + the engine, single-threaded.
- **3 — Repeatable.** A documented method + a named contributor/partner; delivered more than once.
- **4 — Proprietary edge.** A method that is ours, ahead of market, and hard to copy.

| Capability | Powers | Maturity today | The gap |
|---|---|---|---|
| **Cultural value-capture (AOC + signalling)** | every service | **4** | our edge — keep it ahead |
| **Signal / Index analytics** | Scorecard, Signal Fit | **3** | scale the contributor bench |
| Brand & culture domain (per vertical) | all | **3** | thin outside sport/music |
| Reputational & integrity read | Culture DD, advisory | **2** | method to document, source network |
| **Corporate finance & valuation** | Culture DD, Value-Capture Advisory | **2** | core method documented (2026-09-23 sweep); comps library + partner next → [`corporate-finance-and-valuation.md`](./corporate-finance-and-valuation.md) |
| **Legal & transaction (DD, structuring)** | Culture DD | **1** | the priority gap → [`legal-and-transaction.md`](./legal-and-transaction.md) |
| Quant / economic modelling | leakage models, valuation | **2** | econ/stats depth |
| Deal structuring & negotiation | Value-Capture Advisory, Culture DD | **1** | ex-PE/corp-dev capacity |

**Legal & transaction (maturity 1)** is now the remaining honest blocker on the flagship
(Culture DD) — the gap the [Intelligence Services model](../INTELLIGENCE-SERVICES-MODEL.md)
flagged; corporate finance & valuation moved to **2** once its core method was documented
(2026-09-23 sweep). Both keep the fastest learning cadence and the partner track (below).

---

## 2. The learning loop (the "always learning" engine)

A capability at maturity < 4 is on an active learning cadence. The loop runs weekly, via the
`capability-learning-sweep` scheduled task, and does four things:

1. **Scan the market method.** Research the current, market-standard way the skill is
   practised — how PE/corporate-finance actually runs commercial & financial DD, current
   valuation methods (DCF, comparables, precedent transactions, LBO, real-options for
   IP/rights), legal DD checklists and deal structures, and sector-specific moves in our
   verticals. Get *ahead*: note what is emerging, not just what is standard.
2. **Diff against our base.** Compare to the relevant capability file; identify what we're
   missing, what has moved, and what would give us an edge.
3. **Write it forward.** Append the new method, checklists, worked frames and sources to the
   capability file — turning market skill into *our* documented, reusable method.
4. **Open a PR (never auto-merge).** Sibu reviews and merges. Maturity is re-rated as method
   is documented and then used on a real engagement.

Every capability file therefore compounds: it starts as a scaffold and becomes, over weeks,
a genuine proprietary method — which is how a maturity-1 gap climbs to 3 and beyond.

**The partner track (for the two gaps, in parallel with learning):** documenting the method
does not replace the delivery relationship. Corporate-finance and legal DD are *also* a
partner to sign (the Ankura analogue) and, ideally, an ex-PE/corp-finance associate. The
learning loop makes us an intelligent, ahead-of-market *client and co-deliverer* of that
partner — not a dependent one.

---

## 3. The operating rule (how it bakes into every offering)

- **Delivery reads the base.** Every engagement is scoped and delivered against the relevant
  capability files — they are the method of record, not tribal knowledge.
- **Every engagement feeds the base.** What we learn delivering an ask (a new valuation
  wrinkle, a legal structure, a sector shift) is written back into the capability file. The
  offering gets sharper with every job.
- **No ask outruns the capability silently.** If an ask needs a capability below maturity 2,
  that is flagged in scoping and the ask is either phased (deliver the mature layers, partner
  the rest) or held — never over-promised. Capability maturity gates what we sell as
  *deliverable now* vs *by selective engagement*.
- **From today, this applies to all offerings** — Scorecard, Signal Fit, Value-Capture
  Advisory, Culture DD, and every new service — not just the flagship.

---

## Files

- [`corporate-finance-and-valuation.md`](./corporate-finance-and-valuation.md) — the priority gap.
- [`legal-and-transaction.md`](./legal-and-transaction.md) — the priority gap.
- New capability files are added here as services expand; each opens with the same header
  (maturity, owner, cadence, sources) and is grown by the weekly loop.

The measure of this system: the day an ask arrives, the capability to deliver it is already
in the base — learned, documented and ahead of the market, not scrambled for after the call.
