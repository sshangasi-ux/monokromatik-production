# Culture Due Diligence — the billing model

*How a bespoke, high-value advisory engagement is scoped, quoted, contracted and paid —
UX-led, so the buyer always knows what they're buying and what it costs.*

Culture DD is not a R220 report. It is a bespoke engagement into a live (or contemplated)
transaction, so the billing model is **scoped fixed-fee, billed in stages** — never a single
"buy now" charge, and never an open-ended hourly meter. The buyer self-configures an
**indicative estimate** on the site, then a scoping call converts it to a firm quote and an
engagement letter. The front-end for this is the **Scope & Estimate builder**
(`/services/culture-due-diligence/estimate`).

---

## 1. The fee structure — modular fixed-fee

The fee is built from modules the buyer selects. Bands are **indicative** (the site says so
plainly); the firm number is set after the scoping call, in the engagement letter.

| Module | Indicative band (USD) | Delivered by |
|---|---|---|
| Scoping call | Free | MonoKromatik |
| **Value-Capture & Authorship Read** (Core — always included) | $9,000 – $14,000 | MonoKromatik |
| Reputational & Integrity Read | + $5,000 – $8,000 | MonoKromatik |
| Financial & Valuation Read | + $8,000 – $16,000 | MonoKromatik + corp-finance partner |
| Legal & Transaction Read | + $7,000 – $14,000 | Legal partner (co-billed) |
| Post-Deal Retention & Value-Creation Plan | + $6,000 – $10,000 | MonoKromatik |

**Scope multipliers** (applied to the module subtotal — more at stake, more work):

- *Deal size:* < $5m ×0.85 · $5–25m ×1.0 · $25–100m ×1.35 · $100m+ ×1.8
- *Verticals in scope:* 1 ×1.0 · 2 ×1.2 · 3+ ×1.4
- *Turnaround:* Standard (3–4 wks) ×1.0 · Expedited (≤2 wks) ×1.3

The estimator sums the selected module bands, applies the multipliers, and shows a
low–high **indicative range** plus an itemised scope and the payment-stage split.

**Partner pass-through:** the Legal (and, where a third party is used, part of the Financial)
module carries the partner's fee. Until the partner is signed, that module is shown as
*by selective engagement* and priced on quote — consistent with the capability-maturity gate
(see `capability/CAPABILITY-SYSTEM.md`). We never bill for a capability we can't yet staff.

---

## 2. Payment staging — billed to milestones, not upfront

A DD engagement is paid in three stages against delivery, so risk is shared and cash follows
value:

1. **40% deposit** — on signed engagement letter (and NDA). Work starts.
2. **30% interim** — on delivery of the draft read.
3. **30% final** — on delivery of the final report + retention plan.

Partner (legal / financial) fees are billed **at cost, separately**, on the partner's terms.

**Optional value-linked component** (by agreement, larger deals): a modest success/completion
fee on transaction close, in place of part of the fixed fee — aligns us to the outcome without
turning advisory into a contingency arrangement.

---

## 3. Payment methods & mechanics

- **Deposit and stage invoices** are raised as **Paystack Payment Requests** (hosted — card or
  EFT; card details never touch us), or **bank transfer / invoice** for larger engagements.
  This reuses the existing Paystack rail; no new PCI surface.
- **No self-serve card charge** for Culture DD — the "buy" is a scoping call, by design. The
  estimator routes to the commissioning enquiry, not a checkout.
- **Currency:** quoted in USD (the buyers are cross-border capital), invoiced in USD or ZAR by
  agreement.

---

## 4. Terms that protect both sides

- **NDA first** — signed before the scoping call surfaces anything sensitive.
- **Engagement letter** — fixed scope, fee, stages, timeline, and what's explicitly *out* of
  scope. The estimator's scope summary seeds it.
- **Change orders** — any scope change is a written change order with its own fee; the base
  engagement never silently expands.
- **Independence & honesty** — the read carries its counter-case and is not bent to the deal
  the buyer wants; that independence is the product. Stated in the letter.
- **Not investment advice** — an intelligence input to the buyer's own decision, not a
  recommendation to transact.

---

## 5. The UX flow (end to end)

```
Landing page  →  Scope & Estimate builder  →  Indicative range + scope summary
      ↓                                              ↓
  "Book a scoping call"  →  /work-with-us (interest = culture-dd)
      ↓
  NDA  →  Scoping call  →  Firm quote + Engagement letter
      ↓
  40% deposit (Paystack request / transfer)  →  Work starts
      ↓
  Draft read  →  30% interim   →   Final read + retention plan  →  30% final
```

The estimator (`/services/culture-due-diligence/estimate`) is the self-serve front of this:
it makes a bespoke engagement legible and priceable *before* the buyer has to talk to anyone,
which is the UX that converts serious capital — transparency up front, firm quote after the
call. Nothing is charged on the site; the estimate is the invitation to the scoping call.
