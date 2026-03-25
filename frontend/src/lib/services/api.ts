import Sqids from 'sqids';
import { nextId } from './storage';

const sqids = new Sqids({
  alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  minLength: 6,
});

export async function shortenUrl(url: string): Promise<{ id: number; shortCode: string; originalUrl: string }> {
  const id = nextId();
  const apiUrl = import.meta.env.VITE_API_URL;

  if (apiUrl) {
    const response = await fetch(`${apiUrl}/api/urls/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, id }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message?.[0] ?? 'Failed to shorten URL');
    }

    const data = await response.json();
    return { id, ...data };
  }

  const shortCode = sqids.encode([id]).slice(0, 7);
  return { id, shortCode, originalUrl: url };
}
