import Database, { type Database as DatabaseType } from 'better-sqlite3';

export interface WalletRecord {
  user_id: string;
  wallet_id: string;
  wallet_address: string;
  created_at: string;
}

export class WalletDatabase {
  private static instance: WalletDatabase;
  private db: DatabaseType | null = null;
  private initialized: boolean = false;

  private constructor() {}

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

    try {
      this.db = new Database('./wallets.db');

      await this.createTables();
      this.initialized = true;
      console.log('WalletDatabase initialized successfully');
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not available');
    }

    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS wallets (
        user_id TEXT PRIMARY KEY,
        wallet_id TEXT NOT NULL,
        wallet_address TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async getWallet(userId: string): Promise<WalletRecord | null> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const wallet = await this.db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(userId);
    return wallet as WalletRecord | null;
  }

  async saveWallet(userId: string, walletId: string, walletAddress: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    this.db
      .prepare(
        'INSERT OR REPLACE INTO wallets (user_id, wallet_id, wallet_address) VALUES (?, ?, ?)',
      )
      .run(userId, walletId, walletAddress);
  }

  async getAllWallets(): Promise<WalletRecord[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    return this.db
      .prepare('SELECT * FROM wallets ORDER BY created_at DESC')
      .all() as WalletRecord[];
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.initialized = false;
    }
  }
}

export const walletDB = WalletDatabase.getInstance();
