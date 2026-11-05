# Syndicate — per-channel secret checklist

How to get each channel's credentials for the **Syndicate** workflow
(`.github/workflows/syndicate.yml` → `scripts/syndicate.ts`).

Each channel is **independent**: add only the ones you want, in any order. A
channel with no secret set is silently skipped, so you can light them up one at
a time. Nothing posts until you either dispatch with `publish=true` or set the
repo variable `SYNDICATE_AUTOPOST=on`.

> **Where everything goes:** GitHub → the repo → **Settings → Secrets and
> variables → Actions**. Use the **Secrets** tab for tokens/passwords and the
> **Variables** tab for the two non-secret toggles (`BLUESKY_SERVICE`,
> `SYNDICATE_AUTOPOST`). Secret names must match exactly (case-sensitive).

Ranked easiest-first.

---

## 1. Discord — ~1 minute (easiest)

A webhook posts into one channel. No bot, no account token.

1. In the Discord **server**, pick (or make) the channel to post into.
2. Hover the channel → **Edit Channel** (gear) → **Integrations** → **Webhooks**.
3. **New Webhook** → give it a name ("MonoKromatik") and an avatar if you like → **Copy Webhook URL**.

| Secret | Value |
|---|---|
| `DISCORD_WEBHOOK_URL` | the copied URL (looks like `https://discord.com/api/webhooks/123…/abc…`) |

> You need **Manage Webhooks** permission on the server. The URL is itself the
> credential — treat it like a password; anyone with it can post to that channel.

---

## 2. Bluesky — ~1 minute

Use an **app password**, never your main password.

1. Sign in at **bsky.app** → **Settings** → **Privacy and security** → **App passwords**.
2. **Add app password** → name it ("MonoKromatik syndicate") → **Copy** the generated password (format `xxxx-xxxx-xxxx-xxxx`). You only see it once.

| Secret | Value |
|---|---|
| `BLUESKY_IDENTIFIER` | your handle, e.g. `monokromatik.bsky.social` (or the account email) |
| `BLUESKY_APP_PASSWORD` | the app password you just copied |

| Variable (optional) | Value |
|---|---|
| `BLUESKY_SERVICE` | only if you self-host a PDS; defaults to `https://bsky.social` |

---

## 3. Telegram — ~3 minutes

A bot posts into a **channel** you own. Two steps: make the bot, then let it post.

**a) Make the bot (get the token)**
1. In Telegram, open **@BotFather** → send `/newbot`.
2. Give it a name and a username ending in `bot` → BotFather replies with a **token** like `8123456789:AAH…`.

**b) Let the bot post + get the chat id**
1. Create your broadcast **channel** (or use an existing one).
2. Channel → **Manage channel → Administrators → Add admin** → add your bot → leave **Post messages** on.
3. Get the chat id:
   - **Public channel (simplest):** `TELEGRAM_CHAT_ID` is just `@yourchannelusername`.
   - **Private channel:** post anything in it, then open
     `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and read the
     `"chat":{"id":-100…}` value — that negative number is the chat id.

| Secret | Value |
|---|---|
| `TELEGRAM_BOT_TOKEN` | the BotFather token |
| `TELEGRAM_CHAT_ID` | `@yourchannel` (public) or the `-100…` id (private) |

---

## 4. Mastodon — ~3 minutes

You need an account on any instance (e.g. `mastodon.social`).

1. On your instance: **Preferences → Development → New application**.
2. Name it ("MonoKromatik syndicate"). Under scopes, tick **`write:statuses`**
   (and `read` is fine to leave on). **Submit**.
3. Open the application → copy **Your access token**.

| Secret | Value |
|---|---|
| `MASTODON_BASE_URL` | your instance origin, e.g. `https://mastodon.social` (no trailing slash, no path) |
| `MASTODON_ACCESS_TOKEN` | the access token from the app page |

---

## After adding any channel — test before trusting it

1. GitHub → **Actions** → **MonoKromatik Syndicate (free-API channels)** → **Run workflow**.
2. First run with **verify = true** → the run summary lists which channels it sees as configured. Confirm yours shows up.
3. Then **Run workflow** again with **publish = true** → it posts the next item to every configured channel, once each, and records it in the ledger so it won't repeat.
4. Check the post landed, and that the link carries `utm_source=<channel>` (so it attributes in GA).

### Going fully automatic
Once you trust a channel, set the **Variable** `SYNDICATE_AUTOPOST = on`. Then the
MWF schedule (08:17 UTC / 10:17 SAST, Mon/Wed/Fri) posts the next unposted item
on its own. Remove the variable (or set it to anything but `on`) to go back to
review-gated, where scheduled runs only preview.

### Notes
- **Dedup is per channel.** A channel added later starts from the *current*
  latest item forward — it does not retro-post your whole back catalogue.
- The ledger lives in the Actions cache (`output/syndicate-ledger.json`), not in
  the repo, because `main` is branch-protected.
- Rotating a secret: just update it in Settings; no code change needed.
