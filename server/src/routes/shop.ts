import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "./middleware";
import { listShopItems, purchaseItem, getInventory } from "../services/shop";

const router = Router();

router.get("/items", (_req, res) => {
  res.json({ items: listShopItems() });
});

router.get("/inventory", requireAuth, (req: AuthedRequest, res) => {
  res.json({ inventory: getInventory(req.user!.id) });
});

const purchaseSchema = z.object({ itemId: z.string() });

router.post("/purchase", requireAuth, (req: AuthedRequest, res) => {
  try {
    const data = purchaseSchema.parse(req.body);
    const inventory = purchaseItem(req.user!.id, data.itemId);
    res.json({ inventory });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
