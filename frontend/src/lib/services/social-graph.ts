export type ObjectType = 'USER' | 'POST' | 'PHOTO' | 'COMMENT' | 'CHECKIN';

export type AssocType =
  | 'FRIEND'
  | 'LIKES'
  | 'LIKED_BY'
  | 'AUTHORED'
  | 'AUTHORED_BY'
  | 'COMMENTED_ON'
  | 'HAS_COMMENT'
  | 'TAGGED_IN'
  | 'HAS_TAG';

export interface TaoObject {
  id: number;
  type: ObjectType;
  fields: Record<string, string>;
  createdAt: number;
}

export interface TaoAssociation {
  id1: number;
  id2: number;
  type: AssocType;
  time: number;
  data: Record<string, string>;
}

export interface CacheTierStats {
  follower: { hits: number; misses: number; entries: number; maxSize: number };
  leader: { hits: number; misses: number; entries: number; maxSize: number };
  storageReads: number;
}

export interface QueryResult<T> {
  result: T;
  cacheLevel: 'follower' | 'leader' | 'storage';
}

export const INVERSE_MAP: Partial<Record<AssocType, AssocType>> = {
  FRIEND: 'FRIEND',
  LIKES: 'LIKED_BY',
  LIKED_BY: 'LIKES',
  AUTHORED: 'AUTHORED_BY',
  AUTHORED_BY: 'AUTHORED',
  COMMENTED_ON: 'HAS_COMMENT',
  HAS_COMMENT: 'COMMENTED_ON',
  TAGGED_IN: 'HAS_TAG',
  HAS_TAG: 'TAGGED_IN',
};

const OBJECTS_KEY = 'tao-objects';
const ASSOCS_KEY = 'tao-associations';
const COUNTER_KEY = 'tao-counter';
const FOLLOWER_CACHE_KEY = 'tao-follower-cache';
const LEADER_CACHE_KEY = 'tao-leader-cache';
const CACHE_STATS_KEY = 'tao-cache-stats';

const FOLLOWER_MAX = 8;
const LEADER_MAX = 20;

function storage() {
  return typeof localStorage !== 'undefined' ? localStorage : null;
}

function session() {
  return typeof sessionStorage !== 'undefined' ? sessionStorage : null;
}

function readObjects(): TaoObject[] {
  try {
    const raw = storage()?.getItem(OBJECTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeObjects(objects: TaoObject[]): void {
  storage()?.setItem(OBJECTS_KEY, JSON.stringify(objects));
}

function readAssociations(): TaoAssociation[] {
  try {
    const raw = storage()?.getItem(ASSOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAssociations(assocs: TaoAssociation[]): void {
  storage()?.setItem(ASSOCS_KEY, JSON.stringify(assocs));
}

function nextId(): number {
  const s = storage();
  if (!s) return 1;
  const current = parseInt(s.getItem(COUNTER_KEY) ?? '0', 10);
  const next = current + 1;
  s.setItem(COUNTER_KEY, String(next));
  return next;
}

export function createObject(type: ObjectType, fields: Record<string, string>): TaoObject {
  const obj: TaoObject = { id: nextId(), type, fields, createdAt: Date.now() };
  const objects = readObjects();
  objects.push(obj);
  writeObjects(objects);
  return obj;
}

export function getObject(id: number): TaoObject | null {
  return readObjects().find((o) => o.id === id) ?? null;
}

export function getAllObjects(): TaoObject[] {
  return readObjects().sort((a, b) => a.id - b.id);
}

export function createAssociation(
  id1: number,
  type: AssocType,
  id2: number,
  data: Record<string, string> = {},
): TaoAssociation {
  const now = Date.now();
  const assoc: TaoAssociation = { id1, id2, type, time: now, data };
  const assocs = readAssociations();

  const exists = assocs.some((a) => a.id1 === id1 && a.type === type && a.id2 === id2);
  if (exists) return assoc;

  assocs.push(assoc);

  const inverseType = INVERSE_MAP[type];
  if (inverseType && !(id1 === id2 && type === inverseType)) {
    const inverseExists = assocs.some(
      (a) => a.id1 === id2 && a.type === inverseType && a.id2 === id1,
    );
    if (!inverseExists) {
      assocs.push({ id1: id2, id2: id1, type: inverseType, time: now, data });
    }
  }

  writeAssociations(assocs);
  return assoc;
}

export function getAllAssociations(): TaoAssociation[] {
  return readAssociations();
}

export function getDirectAssociations(): TaoAssociation[] {
  const assocs = readAssociations();
  const seen = new Set<string>();
  const result: TaoAssociation[] = [];

  for (const a of assocs) {
    const inverseType = INVERSE_MAP[a.type];
    const inverseKey = `${a.id2}-${inverseType}-${a.id1}`;
    if (seen.has(inverseKey)) continue;
    seen.add(`${a.id1}-${a.type}-${a.id2}`);
    result.push(a);
  }

  return result;
}

export function pointQuery(id1: number, type: AssocType, id2: number): TaoAssociation | null {
  return readAssociations().find((a) => a.id1 === id1 && a.type === type && a.id2 === id2) ?? null;
}

export function rangeQuery(
  id1: number,
  type: AssocType,
  limit: number = 10,
  offset: number = 0,
): TaoAssociation[] {
  return readAssociations()
    .filter((a) => a.id1 === id1 && a.type === type)
    .sort((a, b) => b.time - a.time)
    .slice(offset, offset + limit);
}

export function countQuery(id1: number, type: AssocType): number {
  return readAssociations().filter((a) => a.id1 === id1 && a.type === type).length;
}

type CacheMap = Record<string, unknown>;

function loadCacheTier(key: string): CacheMap {
  try {
    const raw = session()?.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCacheTier(key: string, cache: CacheMap): void {
  session()?.setItem(key, JSON.stringify(cache));
}

function evictLRU(cache: CacheMap, maxSize: number): void {
  const keys = Object.keys(cache);
  while (keys.length > maxSize) {
    const oldest = keys.shift()!;
    delete cache[oldest];
  }
}

function loadCacheStats(): CacheTierStats {
  try {
    const raw = session()?.getItem(CACHE_STATS_KEY);
    return raw
      ? JSON.parse(raw)
      : {
          follower: { hits: 0, misses: 0, entries: 0, maxSize: FOLLOWER_MAX },
          leader: { hits: 0, misses: 0, entries: 0, maxSize: LEADER_MAX },
          storageReads: 0,
        };
  } catch {
    return {
      follower: { hits: 0, misses: 0, entries: 0, maxSize: FOLLOWER_MAX },
      leader: { hits: 0, misses: 0, entries: 0, maxSize: LEADER_MAX },
      storageReads: 0,
    };
  }
}

function saveCacheStats(stats: CacheTierStats): void {
  session()?.setItem(CACHE_STATS_KEY, JSON.stringify(stats));
}

export function queryWithCache<T>(
  queryKey: string,
  queryFn: () => T,
): QueryResult<T> {
  const stats = loadCacheStats();

  const follower = loadCacheTier(FOLLOWER_CACHE_KEY);
  if (queryKey in follower) {
    stats.follower.hits++;
    const result = follower[queryKey] as T;
    delete follower[queryKey];
    follower[queryKey] = result;
    saveCacheTier(FOLLOWER_CACHE_KEY, follower);
    stats.follower.entries = Object.keys(follower).length;
    saveCacheStats(stats);
    return { result, cacheLevel: 'follower' };
  }
  stats.follower.misses++;

  const leader = loadCacheTier(LEADER_CACHE_KEY);
  if (queryKey in leader) {
    stats.leader.hits++;
    const result = leader[queryKey] as T;

    delete leader[queryKey];
    leader[queryKey] = result;
    saveCacheTier(LEADER_CACHE_KEY, leader);

    follower[queryKey] = result;
    evictLRU(follower, FOLLOWER_MAX);
    saveCacheTier(FOLLOWER_CACHE_KEY, follower);

    stats.follower.entries = Object.keys(follower).length;
    stats.leader.entries = Object.keys(leader).length;
    saveCacheStats(stats);
    return { result, cacheLevel: 'leader' };
  }
  stats.leader.misses++;

  const result = queryFn();
  stats.storageReads++;

  leader[queryKey] = result;
  evictLRU(leader, LEADER_MAX);
  saveCacheTier(LEADER_CACHE_KEY, leader);

  follower[queryKey] = result;
  evictLRU(follower, FOLLOWER_MAX);
  saveCacheTier(FOLLOWER_CACHE_KEY, follower);

  stats.follower.entries = Object.keys(follower).length;
  stats.leader.entries = Object.keys(leader).length;
  saveCacheStats(stats);
  return { result, cacheLevel: 'storage' };
}

export function getCacheTierStats(): CacheTierStats {
  const stats = loadCacheStats();
  const follower = loadCacheTier(FOLLOWER_CACHE_KEY);
  const leader = loadCacheTier(LEADER_CACHE_KEY);
  stats.follower.entries = Object.keys(follower).length;
  stats.leader.entries = Object.keys(leader).length;
  stats.follower.maxSize = FOLLOWER_MAX;
  stats.leader.maxSize = LEADER_MAX;
  return stats;
}

export function resetCaches(): void {
  session()?.removeItem(FOLLOWER_CACHE_KEY);
  session()?.removeItem(LEADER_CACHE_KEY);
  session()?.removeItem(CACHE_STATS_KEY);
}

export function clearAll(): void {
  storage()?.removeItem(OBJECTS_KEY);
  storage()?.removeItem(ASSOCS_KEY);
  storage()?.removeItem(COUNTER_KEY);
  resetCaches();
}

export function seedData(): void {
  if (readObjects().length > 0) return;

  const alice = createObject('USER', { name: 'Alice' });
  const bob = createObject('USER', { name: 'Bob' });
  const cathy = createObject('USER', { name: 'Cathy' });
  const david = createObject('USER', { name: 'David' });
  const checkin = createObject('CHECKIN', { name: 'Golden Gate Bridge Check-in' });
  const comment = createObject('COMMENT', { name: "Cathy's Comment" });

  createAssociation(alice.id, 'FRIEND', bob.id);
  createAssociation(alice.id, 'AUTHORED', checkin.id);
  createAssociation(alice.id, 'TAGGED_IN', checkin.id);
  createAssociation(bob.id, 'TAGGED_IN', checkin.id);
  createAssociation(cathy.id, 'COMMENTED_ON', checkin.id);
  createAssociation(cathy.id, 'AUTHORED', comment.id);
  createAssociation(david.id, 'LIKES', checkin.id);
}

export function getObjectLabel(obj: TaoObject): string {
  return obj.fields.name || `${obj.type} #${obj.id}`;
}

export const OBJECT_TYPES: ObjectType[] = ['USER', 'POST', 'PHOTO', 'COMMENT', 'CHECKIN'];

export const ASSOC_TYPES: AssocType[] = [
  'FRIEND',
  'LIKES',
  'AUTHORED',
  'COMMENTED_ON',
  'TAGGED_IN',
];

export const ALL_ASSOC_TYPES: AssocType[] = [
  'FRIEND',
  'LIKES',
  'LIKED_BY',
  'AUTHORED',
  'AUTHORED_BY',
  'COMMENTED_ON',
  'HAS_COMMENT',
  'TAGGED_IN',
  'HAS_TAG',
];
