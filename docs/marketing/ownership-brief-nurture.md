# The Ownership Brief — welcome nurture sequence

A 5-email welcome sequence for every new MonoKromatik subscriber (flagship-gate
unlockers, footer signups, checker captures). Goal: take a fresh subscriber from
"I unlocked one report" → understands the AOC thesis → trusts the method → knows
the offering → takes an action (checker / brief / report). Editorial and soft;
the only hard ask is in email 5.

**Voice:** MonoKromatik editorial — confident, ownership-focused, sourced. Signed
by the desk / Braam. Plain-text-feeling HTML; one idea per email; one primary link.

**Trigger (Kit setup):** Automation — *When a subscriber joins the [main newsletter
form] → subscribe to sequence "The Ownership Brief".* (All `/api/newsletter`
signups attach to that form, so this catches every source.)

**Cadence:** immediate, then +2 days between each (0 / 2 / 4 / 6 / 8).

**Link tokens** (replace with live URLs when pasting into Kit):
- `{{METHOD}}` → https://www.monokromatik.com/reports/the-monokromatik-method
- `{{FINTECH}}` → https://www.monokromatik.com/reports/who-owns-african-fintech-league-table
- `{{CHECKER}}` → https://www.monokromatik.com/value-capture-checker
- `{{SERVICES}}` → https://www.monokromatik.com/services
- `{{BRIEF}}` → https://www.monokromatik.com/work-with-us
- `{{REPORTS}}` → https://www.monokromatik.com/reports

---

## Email 1 — Day 0 · Welcome + the one idea

**Subject:** The one question we ask about everything
**Preview:** Africa authors the culture. Who captures the value?

Thanks for unlocking a MonoKromatik report. Before the next one, here's the single
idea behind all of them.

Africa authors an enormous amount of the world's culture — its music, its sport,
its style, its fintech. And again and again, someone else ends up owning it and
capturing its value. That gap has a name here: **Authorship → Ownership →
Capture**. Finding it — case by case, with the evidence — is the whole job.

So every read we publish answers one question: **who made the value, who owns it,
who keeps it?**

Over the next few emails I'll show you how we answer it, and why you can check
every word. Start where most people do — the full library is free to read:

→ **Browse the reports:** {{REPORTS}}

— Braam, MonoKromatik

---

## Email 2 — Day 2 · Proof (show, don't tell)

**Subject:** Only 2 of 16
**Preview:** What we found when we scored who owns African fintech.

We scored the sixteen leading African fintechs on three independent axes — who
**authored** them, who **owns** them, and where they're legally **domiciled**.

The finding: only about **two of sixteen** are cleanly retained — Tyme and Fawry.
The rest are authored on the continent and owned off it: the operating company in
Lagos or Nairobi, the holding company in Delaware, Mauritius or London.

And it repeats everywhere we look — music (2 of 8 labels retained), beauty (the
biggest diaspora brands all conglomerate-owned), sport (the rights leave, the
clubs stay).

→ **Read the fintech league table:** {{FINTECH}}

That's not an opinion. Every figure is named-sourced, and the piece argues the
other side in a Bear Case — which is the next thing I want to show you.

— Braam

---

## Email 3 — Day 4 · The method (credibility)

**Subject:** Why you can trust a MonoKromatik read
**Preview:** Named sources, graded figures, and a Bear Case every time.

Most cultural commentary asks you to trust the writer. We'd rather you check us.

Four standards, on every serious piece:

- **Named attribution** — never an anonymous "[1]". You weigh the source as you read.
- **Graded figures** — reported vs disclosed. We never estimate a private number into existence.
- **Real sourced images, or none** — never fabricated.
- **A Bear Case** — the strongest argument *against* our own conclusion, every time.

We even published the whole method, so you can hold us to it:

→ **Read The MonoKromatik Method:** {{METHOD}}

The rigour is the product. It's also why these reads hold up in a boardroom, not
just a feed.

— Braam

---

## Email 4 — Day 6 · Make it personal

**Subject:** Run the read on your own brand
**Preview:** The free Value-Capture Checker — about two minutes.

You've seen the lens on fintech, music and sport. Now point it at something you
care about.

The **Value-Capture Checker** asks a few questions about a brand, an asset or a
partnership and returns the verdict — **Retained, Exported, Hollowed or
Contested** — plus where the value is leaking and what to do about it. No email
wall, instant.

→ **Try the Value-Capture Checker:** {{CHECKER}}

It's the same lens we run as paid advisory, offered free. If the verdict
surprises you, that's usually exactly where the money is.

— Braam

---

## Email 5 — Day 8 · The offer (soft CTA)

**Subject:** When you need the read on a real decision
**Preview:** How brands, investors and agents put the lens to work.

By now you know the lens. Here's how people put it to work when there's a
decision on the line:

- **Brands** — a Signal Scorecard on your brand, or a Signal Fit read before you buy a sponsorship.
- **Sport & talent** — a Value-Capture read on an athlete or property: talent as an owned asset.
- **Investors & PE** — Culture Due Diligence on a culture-driven asset: the diligence no bank provides.
- **Research houses** — license the ownership league tables and the Cultural-Signal Index.

Every engagement runs on the same sourced, inspectable method — decision-grade,
not a hot take.

→ **See the services:** {{SERVICES}}  ·  **Tell us the decision:** {{BRIEF}}

Or just reply to this email — I read them.

— Braam

---

## Kit build checklist

1. **Sequences → New sequence** → name it *The Ownership Brief*.
2. Add the 5 emails above (subject + body). Set send delays: email 1 *immediately*,
   emails 2–5 *2 days after the previous*.
3. Fill the link tokens with the live URLs above.
4. Turn each email **Published/live**, then set the sequence live.
5. **Automations → New automation:** trigger *Joins a form* = the main newsletter
   form (the one `/api/newsletter` uses, `KIT_FORM_ID`) → action *Subscribe to
   sequence* = The Ownership Brief.
6. (Optional, later) Tag subscribers by `source` in `/api/newsletter` so
   flagship-unlockers, checker and footer signups can get differentiated tracks.
