import { DataClient } from "../interface/data-client";
import redis from "redis"

export async function connectRedis(onFail?: () => void): Promise<DataClient> {
  const client = redis.createClient({
    url: `rediss://${process.env.REDIS_HOST ?? "oregon-redis.render.com"}:${process.env.REDIS_PORT ?? 6379}`,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
  });

  client.on('connect', () => console.log('Redis client connecting'));
  client.on('ready', () => console.log('Redis client connected'));
  client.on('error', (err) => {
    console.error('Redis client error', err);
    onFail?.();
  });
  client.on('end', () => {
    console.log('Redis client disconnected');
    onFail?.();
  });
  client.on('reconnecting', () => console.log('Redis client reconnecting'));

  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }

  // Close the connection gracefully
  process.on('SIGINT', async () => {
    console.log("Server stopped. Closing Redis connection...");
    await client.quit();
    process.exit(0); // Exit the process forcefully
  });

  return client as DataClient; // Return the client for further use
}
