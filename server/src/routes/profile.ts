import { Router } from "express";
import { z } from "zod";
import { db } from "../services/db";
import { AuthedRequest, requireAuth } from "./middleware";
import { getProfileById } from "../services/auth";

const router = Router();

const equipSchema = z.object({ skinId: z.string().optional(), effectId: z.string().optional() });

router.post("/equip", requireAuth, (req: AuthedRequest, res) => {
  try {
    const data = equipSchema.parse(req.body);
    if (data.skinId) {
      const owns = db
        .prepare(`SELECT 1 FROM inventories WHERE userId = ? AND itemId = ? LIMIT 1`)
        .get(req.user!.id, data.skinId);
      if (!owns) throw new Error("Bạn chưa sở hữu skin này");
      db.prepare(`UPDATE users SET equippedSkin = ? WHERE id = ?`).run(data.skinId, req.user!.id);
    }
    if (data.effectId) {
      const owns = db
        .prepare(`SELECT 1 FROM inventories WHERE userId = ? AND itemId = ? LIMIT 1`)
        .get(req.user!.id, data.effectId);
      if (!owns) throw new Error("Bạn chưa sở hữu hiệu ứng này");
      db.prepare(`UPDATE users SET equippedEffect = ? WHERE id = ?`).run(data.effectId, req.user!.id);
    }
    const profile = getProfileById(req.user!.id);
    res.json({ profile });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
