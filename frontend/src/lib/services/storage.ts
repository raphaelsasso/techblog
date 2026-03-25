export interface StoredUrl {
  originalUrl: string;
  shortCode: string;
  id: number;
  createdAt: number;
  accessCount: number;
}

const STORAGE_KEY = 'url-shortener-data';
const COUNTER_KEY = 'url-shortener-counter';

function readAll(): Record<string, StoredUrl> {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data: Record<string, StoredUrl>): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function nextId(): number {
  if (typeof localStorage === 'undefined') return 1;
  const current = parseInt(localStorage.getItem(COUNTER_KEY) ?? '0', 10);
  const next = current + 1;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

export function saveUrl(id: number, shortCode: string, originalUrl: string): StoredUrl {
  const data = readAll();
  const entry: StoredUrl = {
    originalUrl,
    shortCode,
    id,
    createdAt: Date.now(),
    accessCount: 0,
  };
  data[shortCode] = entry;
  writeAll(data);
  return entry;
}

export function getUrl(shortCode: string): StoredUrl | null {
  const data = readAll();
  return data[shortCode] ?? null;
}

export function incrementAccess(shortCode: string): void {
  const data = readAll();
  if (data[shortCode]) {
    data[shortCode].accessCount++;
    writeAll(data);
  }
}

export function getAllUrls(): StoredUrl[] {
  const data = readAll();
  return Object.values(data).sort((a, b) => b.createdAt - a.createdAt);
}

export function clearAll(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(COUNTER_KEY);
}
