export interface CacheEntry {
  originalUrl: string;
  shortCode: string;
  lastAccessed: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  entries: CacheEntry[];
  maxSize: number;
}

const CACHE_KEY = 'url-shortener-cache';
const STATS_KEY = 'url-shortener-cache-stats';
const DEFAULT_MAX_SIZE = 5;

function loadCache(): Map<string, CacheEntry> {
  if (typeof sessionStorage === 'undefined') return new Map();
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? new Map(JSON.parse(raw)) : new Map();
  } catch {
    return new Map();
  }
}

function saveCache(cache: Map<string, CacheEntry>): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(CACHE_KEY, JSON.stringify(Array.from(cache.entries())));
}

function loadStats(): { hits: number; misses: number } {
  if (typeof sessionStorage === 'undefined') return { hits: 0, misses: 0 };
  try {
    const raw = sessionStorage.getItem(STATS_KEY);
    return raw ? JSON.parse(raw) : { hits: 0, misses: 0 };
  } catch {
    return { hits: 0, misses: 0 };
  }
}

function saveStats(hits: number, misses: number): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.setItem(STATS_KEY, JSON.stringify({ hits, misses }));
}

export function cacheGet(shortCode: string): CacheEntry | null {
  const cache = loadCache();
  const stats = loadStats();
  const entry = cache.get(shortCode);

  if (entry) {
    stats.hits++;
    cache.delete(shortCode);
    entry.lastAccessed = Date.now();
    cache.set(shortCode, entry);
    saveCache(cache);
    saveStats(stats.hits, stats.misses);
    return entry;
  }

  stats.misses++;
  saveStats(stats.hits, stats.misses);
  return null;
}

export function cachePut(shortCode: string, originalUrl: string): void {
  const cache = loadCache();

  if (cache.has(shortCode)) {
    cache.delete(shortCode);
  }

  if (cache.size >= DEFAULT_MAX_SIZE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }

  cache.set(shortCode, {
    originalUrl,
    shortCode,
    lastAccessed: Date.now(),
  });

  saveCache(cache);
}

export function getCacheStats(): CacheStats {
  const cache = loadCache();
  const stats = loadStats();
  return {
    hits: stats.hits,
    misses: stats.misses,
    entries: Array.from(cache.values()).reverse(),
    maxSize: DEFAULT_MAX_SIZE,
  };
}

export function resetCache(): void {
  if (typeof sessionStorage === 'undefined') return;
  sessionStorage.removeItem(CACHE_KEY);
  sessionStorage.removeItem(STATS_KEY);
}
