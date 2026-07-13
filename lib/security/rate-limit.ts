import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

const limiters = new Map<string, Ratelimit>();

export async function rateLimit(
  identifier: string,
  prefix = "rl:function-enquiry"
) {
  let limiter = limiters.get(prefix);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      analytics: true,
      prefix,
    });
    limiters.set(prefix, limiter);
  }
  return limiter.limit(identifier);
}
