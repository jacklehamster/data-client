import { DataClient } from "../interface/data-client";
import redis from "redis"

export interface RedisConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
}

export async function connectRedis(onFail?: () => void, config: RedisConfig = {}): Promise<DataClient> {
  const client = redis.createClient({
    url: `rediss://${config.host ?? process.env.REDIS_HOST ?? "oregon-redis.render.com"}:${config.port ?? process.env.REDIS_PORT ?? 6379}`,
    username: config.user ?? process.env.REDIS_USER,
    password: config.password ?? process.env.REDIS_PASSWORD,
  });

  client.on('connect', () => console.log('Redis client connecting'));
  client.on('ready', () => console.log('Redis client connected'));
  client.on('error', (err) => {
    process.off("SIGINT", onQuit);
    console.error('Redis client error', err);
    try {
      onFail?.();
    } catch (e) {
      console.error(e);
    }
  });
  client.on('end', () => {
    process.off("SIGINT", onQuit);
    console.log('Redis client disconnected');
  });
  client.on('reconnecting', () => console.log('Redis client reconnecting'));

  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }

  const onQuit = async () => {
    console.log("Server stopped. Closing Redis connection...");
    await client.quit();
    process.exit(0); // Exit the process forcefully
  };

  // Close the connection gracefully
  process.on('SIGINT', onQuit);

  return client as DataClient; // Return the client for further use
}
