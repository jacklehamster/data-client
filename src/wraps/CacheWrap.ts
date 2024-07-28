import { DataClient } from "@/interface/data-client";
import { DbApi } from "@/interface/db-api";

export class CacheWrap<T = any> implements DbApi<T> {
  constructor(private redis: DataClient, private api: DbApi) {
  }

  async setData<T extends Object>(key: string, update: ((data: T) => Promise<T | undefined>) | T) {
    const result = await this.api.setData(key, update);
    this.redis.del(`${key}.data`);
    this.redis.del(`${key}.sha`);
    this.redis.del(`${key}.type`);
    return result;
  }

  async getData(key: string) {
    const cachedData = await this.redis.get(`${key}.data`);
    if (cachedData) {
      const cachedSha = await this.redis.get<string>(`${key}.sha`);
      const cachedType = await this.redis.get<string>(`${key}.type`);
      return { data: cachedData as T, type: cachedType ?? undefined, sha: cachedSha };
    }
    const result = await this.api.getData(key);
    this.redis.set(`${key}.data`, result.data);
    this.redis.set(`${key}.sha`, result.sha);
    this.redis.set(`${key}.type`, result.type ?? null);
    return result;
  }

  listKeys(keyprefix?: string, branch?: string, recursive?: number) {
    return this.api.listKeys(keyprefix, branch, recursive);
  }
}
