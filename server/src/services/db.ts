import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.resolve(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "wolvesville.db");
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

type Migration = { name: string; statement: string };

const migrations: Migration[] = [
  {
    name: "users",
    statement: `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      coins INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      equippedSkin TEXT,
      equippedEffect TEXT,
      isAdmin INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL
    );`
  },
  {
    name: "inventories",
    statement: `CREATE TABLE IF NOT EXISTS inventories (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      itemId TEXT NOT NULL,
      itemType TEXT NOT NULL,
      UNIQUE(userId, itemId),
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );`
  },
  {
    name: "sessions",
    statement: `CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      expiresAt INTEGER NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );`
  },
  {
    name: "match_history",
    statement: `CREATE TABLE IF NOT EXISTS match_history (
      id TEXT PRIMARY KEY,
      roomId TEXT NOT NULL,
      userId TEXT NOT NULL,
      roleName TEXT NOT NULL,
      result TEXT NOT NULL,
      xpEarned INTEGER NOT NULL,
      coinsEarned INTEGER NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    );`
  }
];

export const bootstrapDb = () => {
  migrations.forEach((migration) => {
    db.prepare(migration.statement).run();
  });
};
