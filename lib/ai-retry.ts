/**
 * Shared retry-with-backoff for Anthropic API calls.
 *
 * Both fail-closed agents (the Strategist and the Brand Read Editor) make a
 * single messages.create() call and treat ANY throw as a decline/drop. That
 * is correct for permanent failures, but it also means a transient 500/503 or
 * a momentary rate-limit silently costs an article its Brand Read. Over a
 * 29-article backfill that was losing several reads per run to nothing more
 * than Anthropic hiccups.
 *
 * withRetry wraps the call so transient failures are retried with exponential
 * backoff + jitter before we give up. The fail-closed guarantee is unchanged:
 * if every attempt fails, withRetry re-throws the last error and the caller's
 * existing try/catch fail-closes exactly as it does today. We are not
 * swallowing errors — only giving the API a few chances before declaring the
 * read lost.
 *
 * What counts as transient (worth retrying):
 *   - HTTP 408, 409, 429, 500, 502, 503, 504, 529 (Anthropic overloaded)
 *   - network-level errors with no status (ECONNRESET, ETIMEDOUT, fetch fail)
 * What does NOT (fail immediately — retrying can't help):
 *   - 400 bad request, 401 auth, 403 forbidden, 404, 413 too large, etc.
 *
 * Defaults: 3 attempts total, 500ms base delay, doubling, capped at 8s, with
 * jitter so concurrent workers don't retry in lockstep.
 */

export interface RetryOptions {
  /** Total attempts including the first. Default 3. */
  attempts?: number;
  /** Base delay in ms before the first retry. Default 500. */
  baseDelayMs?: number;
  /** Maximum delay between retries in ms. Default 8000. */
  maxDelayMs?: number;
  /** Optional hook for logging each retry (attempt is 1-based, the one about to run). */
  onRetry?: (info: { attempt: number; attempts: number; delayMs: number; error: unknown }) => void;
}

const TRANSIENT_STATUS = new Set([408, 409, 429, 500, 502, 503, 504, 529]);

/**
 * Decide whether an error is worth retrying. Reads a numeric `status` /
 * `statusCode` if the SDK attached one (the Anthropic SDK puts HTTP status on
 * the error), otherwise treats status-less errors (network failures) as
 * transient. A few well-known permanent statuses are explicitly excluded.
 */
export function isTransientError(err: unknown): boolean {
  const status = extractStatus(err);
  if (status === undefined) {
    // No HTTP status — almost always a network/connection error. Retry.
    return true;
  }
  return TRANSIENT_STATUS.has(status);
}

function extractStatus(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const e = err as Record<string, unknown>;
  // The Anthropic SDK exposes `status`; some transports use `statusCode`.
  if (typeof e.status === 'number') return e.status;
  if (typeof e.statusCode === 'number') return e.statusCode;
  // Sometimes nested under a `response`.
  const resp = e.response as Record<string, unknown> | undefined;
  if (resp && typeof resp.status === 'number') return resp.status;
  return undefined;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run `fn`, retrying on transient failures with exponential backoff + jitter.
 * Re-throws the last error if all attempts fail (preserving fail-closed
 * behaviour in the caller). Permanent errors throw immediately without retry.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const attempts = Math.max(1, options.attempts ?? 3);
  const baseDelayMs = options.baseDelayMs ?? 500;
  const maxDelayMs = options.maxDelayMs ?? 8000;

  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const isLast = attempt === attempts;
      if (isLast || !isTransientError(err)) {
        throw err;
      }
      // Exponential backoff: base * 2^(attempt-1), capped, plus full jitter.
      const exp = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt - 1));
      const delayMs = Math.round(Math.random() * exp);
      options.onRetry?.({ attempt, attempts, delayMs, error: err });
      await sleep(delayMs);
    }
  }
  // Unreachable (the loop either returns or throws), but satisfies the type.
  throw lastError;
}
