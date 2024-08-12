export interface DbApi<T = any> {
  listKeys(keyprefix?: string, branch?: string, recursive?: boolean): Promise<any>;
  getData(key: string): Promise<{ data: T; type?: string | null; sha: string | null }>;
  setData(key: string, valueOrCall: T | ((prev: any) => Promise<T>), options?: any): Promise<any>;
}
