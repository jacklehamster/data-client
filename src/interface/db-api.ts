export interface DbApi<T = any> {
  listKeys(subfolder?: string, branch?: string, recursive?: boolean): Promise<any>;
  getData(key: string): Promise<{ data: T; type?: string | null; sha: string | null, url?: string; size?: number }>;
  setData(key: string, valueOrCall: T | ((prev: any) => Promise<T>), options?: any): Promise<any>;
}
