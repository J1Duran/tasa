import { Redis } from "@upstash/redis";

// Initialize Redis client
// Try Vercel KV first (tasa_KV_*), fallback to standard Upstash names
export const redis = new Redis({
  url: process.env.tasa_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.tasa_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * Helper function to safely get JSON from Redis
 */
export async function getJSON(key) {
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    console.error(`Error getting JSON from Redis key ${key}:`, error);
    return null;
  }
}

/**
 * Helper function to safely set JSON in Redis
 */
export async function setJSON(key, value, options = {}) {
  try {
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
    return await redis.set(key, jsonValue, options);
  } catch (error) {
    console.error(`Error setting JSON in Redis key ${key}:`, error);
    throw error;
  }
}

/**
 * Helper function to safely push to a list in Redis
 */
export async function pushToList(key, value) {
  try {
    const jsonValue = typeof value === "string" ? value : JSON.stringify(value);
    return await redis.lpush(key, jsonValue);
  } catch (error) {
    console.error(`Error pushing to Redis list ${key}:`, error);
    throw error;
  }
}

/**
 * Helper function to safely get list range from Redis
 */
export async function getListRange(key, start = 0, end = -1) {
  try {
    const data = await redis.lrange(key, start, end);
    return data.map((item) => {
      try {
        return typeof item === "string" ? JSON.parse(item) : item;
      } catch {
        return item;
      }
    });
  } catch (error) {
    console.error(`Error getting list range from Redis key ${key}:`, error);
    return [];
  }
}

/**
 * Helper function to trim list to keep only N most recent items
 */
export async function trimList(key, length) {
  try {
    return await redis.ltrim(key, 0, length - 1);
  } catch (error) {
    console.error(`Error trimming Redis list ${key}:`, error);
  }
}

/**
 * Helper function to get list length
 */
export async function getListLength(key) {
  try {
    return await redis.llen(key);
  } catch (error) {
    console.error(`Error getting list length for key ${key}:`, error);
    return 0;
  }
}

