// LinkedIn publishing client (versioned Posts API).
//
// Posts an image + commentary to a LinkedIn Page (organization) or member, via
// the three-step image flow: initialize an image upload, PUT the bytes, then
// create the post referencing the returned image URN. Posts nothing unless a
// valid token + author URN are supplied.
//
// Docs: https://learn.microsoft.com/linkedin/marketing/community-management/shares/posts-api
//       https://learn.microsoft.com/linkedin/marketing/community-management/shares/images-api

const REST = 'https://api.linkedin.com/rest';
// LinkedIn requires a version header (YYYYMM) and SUNSETS each one after ~12
// months — a stale value 426s with "Requested version … is not active". 202405
// died in the wild; bump this periodically, or override per-environment with the
// LINKEDIN_VERSION repo variable (which the workflow already passes through).
const VERSION = process.env.LINKEDIN_VERSION || '202606';

function headers(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    'LinkedIn-Version': VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json',
  };
}

export interface LinkedInResult {
  ok: boolean;
  id?: string;
  error?: string;
  /** Whether the follow-up first comment (carrying the link) landed. */
  commentOk?: boolean;
  commentError?: string;
}

/**
 * Comment on a post. Used to put the LINK IN THE FIRST COMMENT: LinkedIn
 * demotes posts carrying an outbound link in the body, so the post itself stays
 * link-free and the URL rides in a comment instead.
 */
export async function commentOnPost(
  token: string,
  actorUrn: string,
  postUrn: string,
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`${REST}/socialActions/${encodeURIComponent(postUrn)}/comments`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ actor: actorUrn, object: postUrn, message: { text } }),
  });
  if (res.ok || res.status === 201) return { ok: true };
  const j = await res.json().catch(() => ({}));
  return { ok: false, error: `comment failed (${res.status}): ${JSON.stringify((j as { message?: string })?.message ?? j)}` };
}

/** Register an image upload for `authorUrn`; returns the upload URL + image URN. */
async function initImageUpload(token: string, authorUrn: string): Promise<{ uploadUrl: string; image: string } | { error: string }> {
  const res = await fetch(`${REST}/images?action=initializeUpload`, {
    method: 'POST',
    headers: headers(token),
    body: JSON.stringify({ initializeUploadRequest: { owner: authorUrn } }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.value?.uploadUrl || !json?.value?.image) {
    return { error: `initializeUpload failed (${res.status}): ${JSON.stringify(json?.message ?? json)}` };
  }
  return { uploadUrl: json.value.uploadUrl, image: json.value.image };
}

/** Download the branded card and PUT its bytes to the LinkedIn upload URL. */
async function uploadImageBytes(uploadUrl: string, token: string, imageUrl: string): Promise<string | null> {
  const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(20_000) });
  if (!imgRes.ok) return `could not fetch card image (${imgRes.status})`;
  const bytes = Buffer.from(await imgRes.arrayBuffer());
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'image/jpeg' },
    body: bytes,
  });
  if (!put.ok) return `image upload PUT failed (${put.status})`;
  return null;
}

/**
 * Publish an image post to LinkedIn. `authorUrn` is e.g.
 * "urn:li:organization:12345678" (a Page) or "urn:li:person:abc123".
 */
export async function publishToLinkedIn(args: {
  token: string;
  authorUrn: string;
  imageUrl: string;
  caption: string;
  altText: string;
  /** Posted as a follow-up comment (keeps the outbound link out of the post body). */
  firstComment?: string;
}): Promise<LinkedInResult> {
  const { token, authorUrn, imageUrl, caption, altText, firstComment } = args;

  const init = await initImageUpload(token, authorUrn);
  if ('error' in init) return { ok: false, error: init.error };

  const upErr = await uploadImageBytes(init.uploadUrl, token, imageUrl);
  if (upErr) return { ok: false, error: upErr };

  // NB: `isReblogDisabledByAuthor` was accepted by older API versions but is
  // rejected outright from ~202600 onward ("unrecognized field found but not
  // allowed"), so it must not be sent. Keep this body minimal — the versioned
  // Posts API 422s on any field it doesn't recognise.
  const body = {
    author: authorUrn,
    commentary: caption,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    content: { media: { altText: altText.slice(0, 290), id: init.image } },
    lifecycleState: 'PUBLISHED',
  };
  const res = await fetch(`${REST}/posts`, { method: 'POST', headers: headers(token), body: JSON.stringify(body) });
  if (res.status === 201 || res.ok) {
    const id = res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id') || undefined;
    if (firstComment && id) {
      // The post is already live; a failed comment must NOT fail the publish —
      // report it so the run summary shows the link needs adding by hand.
      const c = await commentOnPost(token, authorUrn, id, firstComment);
      return { ok: true, id, commentOk: c.ok, commentError: c.error };
    }
    return { ok: true, id };
  }
  const json = await res.json().catch(() => ({}));
  return { ok: false, error: `posts create failed (${res.status}): ${JSON.stringify(json?.message ?? json)}` };
}

/**
 * No-post credential check: confirm the token is valid, name the authorizing
 * member, and — when LINKEDIN_AUTHOR_URN isn't set yet — DERIVE and report it so
 * setup is copy-paste.
 *
 * Prefers /v2/userinfo (OpenID Connect — matches the `openid`/`profile` scopes
 * granted by "Sign In with LinkedIn using OpenID Connect"). Falls back to the
 * legacy /v2/me, which needs `r_liteprofile` and 403s on OIDC-only apps.
 */
export async function verifyLinkedIn(token: string, authorUrn?: string): Promise<{ ok: boolean; detail: string }> {
  let who: string | undefined;
  let derivedUrn: string | undefined;

  const oidc = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (oidc.status === 401) return { ok: false, detail: 'Token invalid or expired (401). Generate a new one.' };

  if (oidc.ok) {
    const u = (await oidc.json().catch(() => ({}))) as { sub?: string; name?: string; given_name?: string };
    who = u.name || u.given_name || u.sub;
    if (u.sub) derivedUrn = `urn:li:person:${u.sub}`;
  } else {
    const res = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${token}`, 'X-Restli-Protocol-Version': '2.0.0' },
    });
    if (res.status === 401) return { ok: false, detail: 'Token invalid or expired (401). Generate a new one.' };
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      return { ok: false, detail: `Token check failed (${res.status}): ${JSON.stringify((j as { message?: string })?.message ?? j)}` };
    }
    const me = (await res.json().catch(() => ({}))) as { id?: string; localizedFirstName?: string; localizedLastName?: string };
    who = me.localizedFirstName ? `${me.localizedFirstName} ${me.localizedLastName ?? ''}`.trim() : me.id;
    if (me.id) derivedUrn = `urn:li:person:${me.id}`;
  }

  if (!authorUrn) {
    return {
      ok: false,
      detail: derivedUrn
        ? `Token valid (as ${who ?? 'member'}). LINKEDIN_AUTHOR_URN is not set — set it to: ${derivedUrn}`
        : `Token valid (as ${who ?? 'member'}), but LINKEDIN_AUTHOR_URN is not set.`,
    };
  }
  return { ok: true, detail: `Token valid (authorized by ${who ?? 'member'}); posting as ${authorUrn}.` };
}
