import { DataClient, ExpirationOptions } from "@/interface/data-client";

const RESET_TIME = 600 * 1000; // 10 minutes
// const RESET_TIME = 10 * 1000; // 10 seconds

export class RedisWrap implements DataClient {
  #redis?: DataClient;
  #cleanupTimeout?: Timer;

  constructor(
    private redisProducer: (onFail?: () => void) => Promise<DataClient>,
    private cleanupTime = RESET_TIME) {
  }

  async cleanupRedis() {
    const redis = this.#redis;
    if (redis) {
      this.#redis = undefined;
      try {
        const code = await redis?.quit();
        console.log("Cleaned up redis. Quit code:", code);
      } catch (e) {
        console.error(e);
      }
    }
    clearTimeout(this.#cleanupTimeout);
    this.#cleanupTimeout = undefined;
  }

  resetTimeout() {
    clearTimeout(this.#cleanupTimeout);
    this.#cleanupTimeout = setTimeout(() => this.cleanupRedis(), this.cleanupTime);
  }

  async #getRedis() {
    const now = Date.now();
    if (!this.#redis) {
      this.#redis = await this.redisProducer(() => this.cleanupRedis());
    }
    this.resetTimeout();
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
