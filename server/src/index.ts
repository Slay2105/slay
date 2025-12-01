import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { config } from "./config";
import { bootstrapDb } from "./services/db";
import authRouter from "./routes/auth";
import shopRouter from "./routes/shop";
import { createRoomRouter } from "./routes/rooms";
import adminRouter from "./routes/admin";
import { RoomManager } from "./game/roomManager";
import profileRouter from "./routes/profile";
import { postLovableCloud } from "./services/lovableCloud";

bootstrapDb();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const roomManager = new RoomManager();

app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/auth", authRouter);
app.use("/api/shop", shopRouter);
app.use("/api", createRoomRouter(roomManager));
app.use("/api", adminRouter(roomManager));
app.use("/api/profile", profileRouter);

roomManager.on("update", (state) => {
  io.to(state.id).emit("room:update", state);
  if (state.phase === "ended" && state.winner) {
    postLovableCloud("/matches", {
      roomId: state.id,
      winner: state.winner,
      finishedAt: Date.now()
    });
  }
});
roomManager.on("created", (state) => {
  io.emit("rooms", roomManager.listRooms());
  postLovableCloud("/rooms", {
    roomId: state.id,
    hostId: state.hostId,
    createdAt: state.createdAt
  });
});
roomManager.on("broadcast", (message) => {
  io.emit("announcement", { message, timestamp: Date.now() });
});

io.on("connection", (socket) => {
  socket.on("room:join", (roomId: string) => {
    socket.join(roomId);
  });
  socket.on("disconnect", () => {
    // placeholder for analytics
  });
});

server.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
