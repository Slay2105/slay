import { Router } from "express";
import { z } from "zod";
import { AuthedRequest, requireAuth } from "./middleware";
import { RoomManager } from "../game/roomManager";

const createRoomSchema = z.object({
  name: z.string().optional(),
  maxPlayers: z.number().min(5).max(16).optional(),
  allowBots: z.boolean().optional(),
  isRanked: z.boolean().optional()
});

const actionSchema = z.object({
  type: z.enum(["kill", "protect", "inspect"]),
  targetId: z.string()
});

const voteSchema = z.object({ targetId: z.string() });
const chatSchema = z.object({ text: z.string().min(1).max(280) });

export const createRoomRouter = (manager: RoomManager) => {
  const router = Router();

  router.get("/rooms", (_req, res) => {
    res.json({ rooms: manager.listRooms() });
  });

  router.post("/rooms", requireAuth, (req: AuthedRequest, res) => {
    try {
      const data = createRoomSchema.parse(req.body ?? {});
      const state = manager.createRoom(req.user!, data);
      res.json({ room: state });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.get("/rooms/:roomId", (_req, res) => {
    try {
      const room = manager.getRoom(_req.params.roomId);
      res.json({ room: room.state });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  });

  router.post("/rooms/:roomId/join", requireAuth, (req: AuthedRequest, res) => {
    try {
      const room = manager.joinRoom(req.params.roomId, req.user!);
      res.json({ room });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/rooms/:roomId/bots", (req, res) => {
    try {
      const room = manager.addBot(req.params.roomId);
      res.json({ room });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/rooms/:roomId/start", (req, res) => {
    try {
      const room = manager.startRoom(req.params.roomId);
      res.json({ room });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post("/rooms/:roomId/advance", (req, res) => {
    try {
      const room = manager.advance(req.params.roomId);
      res.json({ room });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  router.post(
    "/rooms/:roomId/action",
    requireAuth,
    (req: AuthedRequest, res) => {
      try {
        const data = actionSchema.parse(req.body);
        const room = manager.getRoom(req.params.roomId);
        const slot = room.state.players.find(
          (player) => player.profile.id === req.user!.id
        );
        if (!slot) throw new Error("Bạn chưa tham gia phòng này");
        manager.queueAction(room.state.id, slot.id, data);
        res.json({ message: "Đã ghi nhận hành động" });
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  router.post(
    "/rooms/:roomId/vote",
    requireAuth,
    (req: AuthedRequest, res) => {
      try {
        const data = voteSchema.parse(req.body);
        const room = manager.getRoom(req.params.roomId);
        const slot = room.state.players.find(
          (player) => player.profile.id === req.user!.id
        );
        if (!slot) throw new Error("Bạn chưa tham gia phòng này");
        manager.vote(room.state.id, slot.id, data.targetId);
        res.json({ message: "Đã bỏ phiếu" });
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  router.post(
    "/rooms/:roomId/chat",
    requireAuth,
    (req: AuthedRequest, res) => {
      try {
        const data = chatSchema.parse(req.body);
        const room = manager.getRoom(req.params.roomId);
        const slot = room.state.players.find(
          (player) => player.profile.id === req.user!.id
        );
        if (!slot) throw new Error("Bạn chưa tham gia phòng này");
        manager.chat(room.state.id, slot.id, data.text);
        res.json({ ok: true });
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  return router;
};
