import { DataClient, ExpirationOptions } from "@/interface/data-client";

const RESET_TIME = 3600 * 1000; // 1 hour

export class RedisWrap implements DataClient {
  #redis?: DataClient;
  #lastAccess = 0;

  constructor(private redisProducer: (onFail?: () => void) => Promise<DataClient>) {
  }

  async #getRedis() {
    const now = Date.now();
    if (!this.#redis || now - this.#lastAccess > RESET_TIME) {
      this.#redis?.quit();
      this.#redis = await this.redisProducer(() => {
        this.#redis = undefined;
      });
    }
    this.#lastAccess = now;
    return this.#redis;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      return this.#getRedis().then(r => r.get(key));
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async set(key: string, value: string | Buffer | null, options?: ExpirationOptions): Promise<string | Buffer | null> {
    try {
      if (!value) {
        await this.#getRedis().then(r => r.del(key));
        return null;
      }
      return await this.#getRedis().then(r => r.set(key, value, options));
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  async del(key: string): Promise<number> {
    return await this.#getRedis().then(r => r.del(key));
  }
  async quit(callback?: (err: Error | null, res: string) => void): Promise<string> {
    const result = await this.#getRedis().then(r => r.quit(callback));
    this.#redis = undefined;
    return result;
  }
}
