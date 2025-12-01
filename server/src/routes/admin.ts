import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAdmin, requireAuth } from "./middleware";
import { db } from "../services/db";
import { RoomManager } from "../game/roomManager";

const grantSchema = z.object({
  userId: z.string(),
  xp: z.number().optional(),
  coins: z.number().optional(),
  level: z.number().optional()
});

const broadcastSchema = z.object({ message: z.string().min(3) });

const adminRouter = (manager: RoomManager) => {
  const router = Router();

  router.post("/admin/grant", requireAuth, requireAdmin, (req: AuthedRequest, res) => {
    try {
      const data = grantSchema.parse(req.body);
      const segments: string[] = [];
      const params: (number | string)[] = [];
      if (data.xp !== undefined) {
        segments.push("xp = xp + ?");
        params.push(data.xp);
      }
      if (data.coins !== undefined) {
        segments.push("coins = coins + ?");
        params.push(data.coins);
      }
      if (data.level !== undefined) {
        segments.push("level = ?");
        params.push(data.level);
      }
      if (!segments.length) throw new Error("Không có giá trị để cập nhật");
      params.push(data.userId);
      db.prepare(`UPDATE users SET ${segments.join(", ")} WHERE id = ?`).run(...params);
      res.json({ message: "Đã cập nhật" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/admin/broadcast", requireAuth, requireAdmin, (req: AuthedRequest, res) => {
    try {
      const data = broadcastSchema.parse(req.body);
      manager.emit("broadcast", data.message);
      res.json({ message: "Đã gửi thông báo" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  return router;
};

export default adminRouter;
