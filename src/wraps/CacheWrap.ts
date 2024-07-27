import { DataClient } from "@/interface/data-client";
import { DbApi } from "@/interface/db-api";

export class CacheWrap<T = any> implements DbApi<T> {
  constructor(private cache: DataClient, private api: DbApi) {
  }

  async setData<T extends Object>(key: string, update: ((data: T) => Promise<T | undefined>) | T) {
    const result = await this.api.setData(key, update);
    this.cache.del(`${key}.data`);
    this.cache.del(`${key}.sha`);
    this.cache.del(`${key}.type`);
    return result;
  }

  async getData(key: string): Promise<{ data: T; sha: string|null; type?: string }> {
    const cachedData = await this.cache.get(`${key}.data`);
    if (cachedData) {
      const cachedSha = await this.cache.get<string>(`${key}.sha`);
      const cachedType = await this.cache.get<string>(`${key}.type`);
      return { data: cachedData as T, type: cachedType ?? undefined, sha: cachedSha };
    }
    const result = await this.api.getData(key);
    this.cache.set(`${key}.data`, result.data);
    this.cache.set(`${key}.sha`, result.sha);
    this.cache.set(`${key}.type`, result.type ?? null);
    return result;
  }

  listKeys(keyprefix?: string, branch?: string, recursive?: number): Promise<any> {
    return this.api.listKeys(keyprefix, branch, recursive);
  }
}
