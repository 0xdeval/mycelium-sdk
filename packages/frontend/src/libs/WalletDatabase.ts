import * as fs from 'node:fs/promises';
import path from 'node:path';

export interface WalletRecord {
  user_id: string;
  wallet_id: string;
  wallet_address: string;
  created_at: string;
}

type WalletMap = Record<string, WalletRecord>;

export class WalletDatabase {
  private static instance: WalletDatabase;
  private initialized = false;
  private filePath: string;
  private cache: WalletMap = {};

  private lock: Promise<void> = Promise.resolve();

  private constructor() {
    this.filePath = path.join(process.cwd(), 'wallets.json');
  }

  static getInstance(): WalletDatabase {
    if (!WalletDatabase.instance) {
      WalletDatabase.instance = new WalletDatabase();
    }
    return WalletDatabase.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }
    await this.ensureFile();
    this.cache = await this.readFile();
    this.initialized = true;
    console.log('WalletDatabase (file) initialized:', this.filePath);
  }

  private async ensureFile(): Promise<void> {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, JSON.stringify({}, null, 2), 'utf8');
    }
  }

  private async readFile(): Promise<WalletMap> {
    try {
      const txt = await fs.readFile(this.filePath, 'utf8');
      if (!txt.trim()) {
        return {};
      }
      const data = JSON.parse(txt);
      if (Array.isArray(data)) {
        const map: WalletMap = {};
        for (const r of data) {
          if (r?.user_id) {
            map[r.user_id] = r as WalletRecord;
          }
        }
        return map;
      }
      return (data as WalletMap) || {};
    } catch (e) {
      try {
        await fs.rename(this.filePath, `${this.filePath}.corrupt.${Date.now()}`);
      } catch {
        console.error('Error renaming corrupted file', e);
      }
      await fs.writeFile(this.filePath, JSON.stringify({}, null, 2), 'utf8');
      return {};
    }
  }

  private async writeFile(data: WalletMap): Promise<void> {
    const tmp = `${this.filePath}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(tmp, this.filePath);
  }

  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const prev = this.lock;
    let release!: () => void;
    this.lock = new Promise<void>((res) => {
      release = res;
    });
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  async getWallet(userId: string): Promise<WalletRecord | null> {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }
    return this.cache[userId] ?? null;
  }

  async saveWallet(userId: string, walletId: string, walletAddress: string): Promise<void> {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }

    await this.withLock(async () => {
      const latest = await this.readFile();
      const existing = latest[userId];

      const record: WalletRecord = {
        user_id: userId,
        wallet_id: walletId,
        wallet_address: walletAddress,
        created_at: existing?.created_at ?? new Date().toISOString(),
      };

      latest[userId] = record;
      this.cache = latest;
      await this.writeFile(latest);
    });
  }

  async getAllWallets(): Promise<WalletRecord[]> {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }
    const arr = Object.values(this.cache);
    arr.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    return arr;
  }

  async close(): Promise<void> {
    this.initialized = false;
    this.cache = {};
  }
}

export const walletDB = WalletDatabase.getInstance();
