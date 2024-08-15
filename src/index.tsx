import { DataClient } from "./interface/data-client";
import { connectRedis } from "./redis/redis-util";
import { RedisWrap } from "./redis/redis-wrap";

export { CacheWrap } from "./wraps/CacheWrap";
export { DataClient, ExpirationOptions } from "./interface/data-client";
export { DbApi } from "./interface/db-api";
export { RedisWrap } from "./redis/redis-wrap";

export { connectRedis };

export function createRedisClient(cleanupTime?: number): DataClient {
  return new RedisWrap(connectRedis, cleanupTime);
}
