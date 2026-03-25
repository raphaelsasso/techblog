import { Injectable } from '@nestjs/common';
import Sqids from 'sqids';

@Injectable()
export class UrlShortenerService {
  private readonly sqids: Sqids;

  constructor() {
    this.sqids = new Sqids({
      alphabet: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      minLength: 6,
    });
  }

  encode(id: number): string {
    return this.sqids.encode([id]).slice(0, 7);
  }

  decode(shortCode: string): number | null {
    const decoded = this.sqids.decode(shortCode);
    return decoded.length > 0 ? decoded[0] : null;
  }
}
