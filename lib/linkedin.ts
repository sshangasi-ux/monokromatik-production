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
// LinkedIn requires a version header (YYYYMM). Bump as versions sunset; override
// with LINKEDIN_VERSION if needed.
const VERSION = process.env.LINKEDIN_VERSION || '202405';

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
}): Promise<LinkedInResult> {
  const { token, authorUrn, imageUrl, caption, altText } = args;

  const init = await initImageUpload(token, authorUrn);
  if ('error' in init) return { ok: false, error: init.error };

  const upErr = await uploadImageBytes(init.uploadUrl, token, imageUrl);
  if (upErr) return { ok: false, error: upErr };

  const body = {
    author: authorUrn,
    commentary: caption,
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    content: { media: { altText: altText.slice(0, 290), id: init.image } },
    lifecycleState: 'PUBLISHED',
    isReblogDisabledByAuthor: false,
  };
  const res = await fetch(`${REST}/posts`, { method: 'POST', headers: headers(token), body: JSON.stringify(body) });
  if (res.status === 201 || res.ok) {
    const id = res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id') || undefined;
    return { ok: true, id };
  }
  const json = await res.json().catch(() => ({}));
  return { ok: false, error: `posts create failed (${res.status}): ${JSON.stringify(json?.message ?? json)}` };
}

/** No-post credential check: confirm the token is valid and report the author. */
export async function verifyLinkedIn(token: string, authorUrn?: string): Promise<{ ok: boolean; detail: string }> {
  // /v2/me validates the token (returns the authorizing member).
  const res = await fetch('https://api.linkedin.com/v2/me', {
    headers: { Authorization: `Bearer ${token}`, 'X-Restli-Protocol-Version': '2.0.0' },
  });
  if (res.status === 401) return { ok: false, detail: 'Token invalid or expired (401).' };
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    return { ok: false, detail: `Token check failed (${res.status}): ${JSON.stringify(j?.message ?? j)}` };
  }
  const me = await res.json().catch(() => ({}));
  const who = me?.localizedFirstName ? `${me.localizedFirstName} ${me.localizedLastName ?? ''}`.trim() : me?.id || 'member';
  if (!authorUrn) return { ok: false, detail: `Token valid (as ${who}), but LINKEDIN_AUTHOR_URN is not set.` };
  return { ok: true, detail: `Token valid (authorized by ${who}); posting as ${authorUrn}.` };
}
