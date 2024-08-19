import { DataClient } from "@/interface/data-client";
import { DbApi } from "@/interface/db-api";

export class CacheWrap<T = any> implements DbApi<T> {
  constructor(private redis: DataClient, private api: DbApi) {
  }

  async setData<T extends Object>(key: string, update: ((data: T) => Promise<T | undefined>) | T) {
    const result = await this.api.setData(key, update);
    this.redis.del(`${key}.data`);
    this.redis.del(`${key}.info`);
    return result;
  }

  async getData(key: string) {
    const cachedData = await this.redis.get(`${key}.data`);
    if (cachedData) {
      const info = await this.redis.get<string>(`${key}.info`);
      const [cachedSha, cachedType] = info?.split(",") ?? [null, null];
      return {
        data: (cachedType === "object" ? JSON.parse(cachedData as string) : cachedData) as T,
        type: cachedType || null, sha: cachedSha || null,
      };
    }
    const result = await this.api.getData(key);
    console.log("Cache miss", key, result);
    const type = result.type ?? "object";
    this.redis.set(`${key}.data`, type === "object" ? JSON.stringify(result.data) : result.data);
    this.redis.set(`${key}.info`, `${result.sha ?? ""},${type}`);
    return result;
  }

  listKeys(subfolder?: string, branch?: string, recursive?: boolean) {
    return this.api.listKeys(subfolder, branch, recursive);
  }
}
