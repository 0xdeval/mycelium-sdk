import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";

export interface WalletRecord {
  user_id: string;
  wallet_id: string;
  wallet_address: string;
  created_at: string;
}

export class WalletDatabase {
  private static instance: WalletDatabase;
  private db: Database | null = null;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): WalletDatabase {
    if (!WalletDatabase.instance) {
      WalletDatabase.instance = new WalletDatabase();
    }
    return WalletDatabase.instance;
  }

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      this.db = await open({
        filename: "./wallets.db",
        driver: sqlite3.Database,
      });

      await this.createTables();
      this.initialized = true;
      console.log("WalletDatabase initialized successfully");
    } catch (error) {
      throw new Error(`Failed to initialize database: ${error}`);
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error("Database not available");

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
    if (!this.db) throw new Error("Database not initialized");

    const wallet = await this.db.get(
      "SELECT * FROM wallets WHERE user_id = ?",
      [userId]
    );
    return wallet || null;
  }

  async saveWallet(
    userId: string,
    walletId: string,
    walletAddress: string
  ): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    await this.db.run(
      "INSERT OR REPLACE INTO wallets (user_id, wallet_id, wallet_address) VALUES (?, ?, ?)",
      [userId, walletId, walletAddress]
    );
  }

  async getAllWallets(): Promise<WalletRecord[]> {
    if (!this.db) throw new Error("Database not initialized");

    return await this.db.all("SELECT * FROM wallets ORDER BY created_at DESC");
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
