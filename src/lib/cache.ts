/**
 * Client-side cache with TTL — for resource lists, exam metadata, roadmap definitions.
 * Backed by sessionStorage so it clears when the tab/browser closes.
 * Never cache private/sensitive user data.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry<unknown>>();

/**
 * Get a cached value. Returns null if not found or expired.
 */
export function getCached<T>(key: string): T | null {
  // Check memory cache first
  const memEntry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (memEntry && memEntry.expiresAt > Date.now()) {
    return memEntry.data;
  }

  // Check sessionStorage
  try {
    const raw = sessionStorage.getItem(`studyhub_cache_${key}`);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (entry.expiresAt <= Date.now()) {
      sessionStorage.removeItem(`studyhub_cache_${key}`);
      return null;
    }
    // Warm memory cache
    memoryCache.set(key, entry);
    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Set a cached value with a TTL in seconds.
 */
export function setCached<T>(key: string, data: T, ttlSeconds = 300): void {
  const entry: CacheEntry<T> = {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  };

  memoryCache.set(key, entry);

  try {
    sessionStorage.setItem(`studyhub_cache_${key}`, JSON.stringify(entry));
  } catch {
    // sessionStorage quota exceeded or not available — memory cache only
  }
}

/**
 * Invalidate a specific cache key.
 */
export function invalidateCache(key: string): void {
  memoryCache.delete(key);
  try {
    sessionStorage.removeItem(`studyhub_cache_${key}`);
  } catch {
    // ignore
  }
}

/**
 * Invalidate all cache keys matching a prefix.
 */
export function invalidateCacheByPrefix(prefix: string): void {
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(`studyhub_cache_${prefix}`)) {
        sessionStorage.removeItem(k);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Cache key constants for shared use.
 */
export const CACHE_KEYS = {
  RESOURCES_LIST: 'resources_list',
  EXAM_CONFIGS: 'exam_configurations',
  ROADMAPS_LIST: 'roadmaps_list',
  FEATURE_FLAGS: 'feature_flags',
  MOCK_TESTS_LIST: 'mock_tests_list',
} as const;
