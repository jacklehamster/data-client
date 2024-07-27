import { DataClient, ExpirationOptions } from "@/interface/data-client";

export class RedisWrap implements DataClient {
  #redis?: DataClient;
  #lastAccess = 0;
  
  constructor(private redisProducer: (onFail?: () => void) => Promise<DataClient>) {
  }

  async #getRedis() {
    const now = Date.now();
    if (!this.#redis || now - this.#lastAccess > 3600 * 1000) { // 1 hour
      this.#redis?.quit();
      this.#redis = await this.redisProducer(() => {
        this.#redis = undefined;
      });
    } else {
      this.#lastAccess = now;
    }
    return this.#redis;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      console.log("Getting key", key);
      return this.#getRedis().then(r => r.get(key));
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async set(key: string, value: string | null, options?: ExpirationOptions): Promise<string | Blob | null> {
    if (!value) {
      this.#getRedis().then(r => r.del(key));
      return null;
    }
    return this.#getRedis().then(r => r.set(key, value, options));
  }
  async del(key: string): Promise<number> {
    return await this.#getRedis().then(r => r.del(key));
  }
  async quit(callback?: (err: Error | null, res: string) => void): Promise<string> {
    return await this.#getRedis().then(r => r.quit(callback));
  }
}
