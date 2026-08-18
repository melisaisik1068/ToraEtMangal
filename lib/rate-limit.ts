type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || now > current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { success: false, remaining: 0, retryAfterMs: current.resetAt - now };
  }

  current.count += 1;
  return { success: true, remaining: limit - current.count };
}

/** Login, sipariş ve garson çağrıları için kullanılabilecek endpoint anahtarları. */
export const RATE_LIMITS = {
  login: { limit: 8, windowMs: 15 * 60 * 1000 },
  order: { limit: 20, windowMs: 10 * 60 * 1000 },
  waiter: { limit: 12, windowMs: 5 * 60 * 1000 },
  reservation: { limit: 8, windowMs: 15 * 60 * 1000 },
} as const;
