import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { db } from "./db";
import { PlayerProfile } from "../types";
import { config } from "../config";

const SELECT_PROFILE = `SELECT id, username, email, level, xp, coins, wins, losses, equippedSkin, equippedEffect, isAdmin FROM users WHERE id = ?`;
const SELECT_INVENTORY = `SELECT itemId, itemType FROM inventories WHERE userId = ?`;

type UserRow = {
  id: string;
  username: string;
  email: string;
  password?: string;
  level: number;
  xp: number;
  coins: number;
  wins: number;
  losses: number;
  equippedSkin?: string;
  equippedEffect?: string;
  isAdmin: number;
};

const hydrateProfile = (row: UserRow): PlayerProfile => {
  const inventory = db.prepare(SELECT_INVENTORY).all(row.id) as {
    itemId: string;
    itemType: string;
  }[];
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    level: row.level,
    xp: row.xp,
    coins: row.coins,
    wins: row.wins,
    losses: row.losses,
    skins: inventory.filter((item) => item.itemType === "skin").map((item) => item.itemId),
    effects: inventory.filter((item) => item.itemType === "effect").map((item) => item.itemId),
    equippedSkin: row.equippedSkin ?? undefined,
    equippedEffect: row.equippedEffect ?? undefined,
    isAdmin: row.isAdmin === 1
  };
};

export const registerUser = async (params: {
  username: string;
  email: string;
  password: string;
}): Promise<PlayerProfile> => {
  const hashed = await bcrypt.hash(params.password, 10);
  const now = Date.now();
  const id = uuid();
  db.prepare(
    `INSERT INTO users (id, username, email, password, createdAt, xp, level, coins) VALUES (?, ?, ?, ?, ?, 0, 1, 500)`
  ).run(id, params.username, params.email, hashed, now);
  db.prepare(
    `INSERT INTO inventories (id, userId, itemId, itemType) VALUES (lower(hex(randomblob(8))), ?, ?, ?)`
  ).run(id, "pink-angel", "skin");
  const row = db.prepare(SELECT_PROFILE).get(id) as UserRow;
  return hydrateProfile(row);
};

export const authenticateUser = async (params: {
  usernameOrEmail: string;
  password: string;
}): Promise<{ profile: PlayerProfile; token: string } | null> => {
  const row = db
    .prepare(
      `SELECT id, username, email, password, level, xp, coins, wins, losses, equippedSkin, equippedEffect, isAdmin FROM users WHERE username = ? OR email = ?`
    )
    .get(params.usernameOrEmail, params.usernameOrEmail) as
    | (UserRow & { password: string })
    | undefined;
  if (!row) return null;
  const valid = await bcrypt.compare(params.password, row.password);
  if (!valid) return null;
  const payload = { sub: row.id };
  const token = jwt.sign(payload, config.jwtSecret, {
    expiresIn: `${config.jwtExpiresInHours}h`
  });
  db.prepare(
    `INSERT INTO sessions (token, userId, createdAt, expiresAt) VALUES (?, ?, ?, ?)`
  ).run(token, row.id, Date.now(), Date.now() + config.jwtExpiresInHours * 3600 * 1000);
  return { profile: hydrateProfile(row), token };
};

export const verifyToken = (token: string): PlayerProfile | null => {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { sub: string };
    const row = db.prepare(SELECT_PROFILE).get(decoded.sub) as UserRow | undefined;
    if (!row) return null;
    return hydrateProfile(row);
  } catch (error) {
    return null;
  }
};

export const getProfileById = (userId: string): PlayerProfile | null => {
  const row = db.prepare(SELECT_PROFILE).get(userId) as UserRow | undefined;
  if (!row) return null;
  return hydrateProfile(row);
};
