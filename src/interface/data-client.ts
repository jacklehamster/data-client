/*
  NX: Only set the key if it does not already exist.
  XX: Only set the key if it already exists.
  EX: Set the specified expire time, in seconds.
  PX: Set the specified expire time, in milliseconds.
  KEEPTTL: Retain the time to live associated with the key.
  GET: Return the old value stored at key, or nil when key did not exist.
*/
export interface ExpirationOptions {
  EX?: number;
  PX?: number;
  NX?: boolean;
  XX?: boolean;
  KEEPTTL?: boolean;
  GET?: boolean;
}

export interface DataClient {
  get<T = string | Blob | null>(key: string): Promise<T | null>;
  set(key: string, value: string | Buffer | null, options?: ExpirationOptions): Promise<string | Buffer | null>;
  del(key: string): Promise<number>;
  quit(callback?: (err: Error | null, res: string) => void): Promise<string>;
}
