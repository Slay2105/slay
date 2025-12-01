import { db } from "./db";
import { SHOP_ITEMS } from "../data/shopItems";
import { InventoryItem } from "../types";

const bundleContents: Record<string, string[]> = {};

export const listShopItems = (): InventoryItem[] => SHOP_ITEMS;

export const getInventory = (userId: string) => {
  const rows = db
    .prepare(`SELECT itemId, itemType FROM inventories WHERE userId = ?`)
    .all(userId);
  return rows;
};

export const purchaseItem = (userId: string, itemId: string) => {
  const item = SHOP_ITEMS.find((entry) => entry.id === itemId);
  if (!item) {
    throw new Error("Item không tồn tại");
  }
  const user = db
    .prepare(`SELECT coins FROM users WHERE id = ?`)
    .get(userId) as { coins: number } | undefined;
  if (!user) throw new Error("User không tồn tại");
  if (user.coins < item.price) throw new Error("Không đủ coin");
  const targets =
    item.type === "bundle" ? bundleContents[item.id] ?? [item.id] : [item.id];
  const txn = db.transaction(() => {
    db.prepare(`UPDATE users SET coins = coins - ? WHERE id = ?`).run(
      item.price,
      userId
    );
    targets.forEach((targetId) => {
      const ref = SHOP_ITEMS.find((entry) => entry.id === targetId);
      const type = ref?.type ?? item.type;
      db.prepare(
        `INSERT OR IGNORE INTO inventories (id, userId, itemId, itemType) VALUES (lower(hex(randomblob(8))), ?, ?, ?)`
      ).run(userId, targetId, type);
    });
  });
  txn.immediate();
  return getInventory(userId);
};
