// lib/rateLimit.js
//
// Simple in-memory sliding-window rate limiter.
//
// LIMITATION: this state lives in the Node process's memory. It works
// correctly for local development and any single-instance deployment, but
// on a multi-instance serverless host (e.g. Vercel with concurrent
// invocations) each instance has its own counters, so the *effective*
// limit is higher than the numbers below suggest. Before high-traffic
// production use, replace this with a shared store (e.g. Upstash Redis) —
// the call sites (`checkRateLimit`) won't need to change.

const buckets = new Map();

export function checkRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    buckets.set(key, { windowStart: now, count: 1 });
    return { allowed: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    const retryAfterMs = windowMs - (now - entry.windowStart);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count += 1;
  return { allowed: true, remaining: limit - entry.count };
}

// Periodically clear stale buckets so this Map doesn't grow forever in a
// long-running process.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now - entry.windowStart > 60 * 60 * 1000) buckets.delete(key);
  }
}, 10 * 60 * 1000).unref?.();
