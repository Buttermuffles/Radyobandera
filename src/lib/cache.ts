interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const store = new Map<string, CacheEntry<unknown>>();

export function getCache<T>(key: string, ttl: number): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttl) {
    return null;
  }
  return entry.data as T;
}

export function getCacheStale<T>(key: string, hardTtl: number): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > hardTtl) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function setCache<T>(key: string, data: T): void {
  store.set(key, { data, timestamp: Date.now() });
}

export function findInCache<T>(predicate: (data: T) => boolean): T | null {
  for (const entry of store.values()) {
    if (predicate(entry.data as T)) {
      return entry.data as T;
    }
  }
  return null;
}

export function clearCache(pattern?: string): void {
  if (!pattern) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.includes(pattern)) {
      store.delete(key);
    }
  }
}

function serializeCache(): string {
  const obj: Record<string, { data: unknown; timestamp: number }> = {};
  for (const [key, entry] of store.entries()) {
    obj[key] = entry;
  }
  return JSON.stringify(obj);
}

function deserializeCache(json: string): void {
  try {
    const obj = JSON.parse(json);
    for (const [key, entry] of Object.entries(obj)) {
      const { data, timestamp } = entry as CacheEntry<unknown>;
      store.set(key, { data, timestamp });
    }
  } catch {
    /* ignore corrupt cache */
  }
}

const STORAGE_KEY = "app-cache";

export function persistCache(): void {
  try {
    const serialized = serializeCache();
    localStorage.setItem(STORAGE_KEY, serialized);
    setCacheCookie();
  } catch {
    /* storage full or unavailable */
  }
}

const CACHE_COOKIE = "ac_cache";

export function hasCacheCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(CACHE_COOKIE + "="));
}

export function setCacheCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CACHE_COOKIE}=1; path=/; max-age=604800; SameSite=Lax`;
}

export function hydrateCache(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      deserializeCache(saved);
    }
  } catch {
    /* ignore */
  }
}

export function clearStorageCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
