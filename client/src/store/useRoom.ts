import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import api from "../lib/api";
import { GameRoomState } from "../types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

type RoomStore = {
  rooms: GameRoomState[];
  currentRoom?: GameRoomState;
  socket?: Socket;
  connect: () => void;
  fetchRooms: () => Promise<void>;
  createRoom: (payload?: Partial<{ name: string; maxPlayers: number }>) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  addBot: (roomId: string) => Promise<void>;
  startRoom: (roomId: string) => Promise<void>;
  advanceRoom: (roomId: string) => Promise<void>;
  sendAction: (roomId: string, action: { type: "kill" | "protect" | "inspect"; targetId: string }) => Promise<void>;
  vote: (roomId: string, targetId: string) => Promise<void>;
};

export const useRoomStore = create<RoomStore>((set, get) => ({
  rooms: [],
  currentRoom: undefined,
  socket: undefined,
  connect() {
    if (get().socket) return;
    const socket = io(SOCKET_URL, { withCredentials: false });
    socket.on("rooms", (rooms: GameRoomState[]) => set({ rooms }));
    socket.on("room:update", (room: GameRoomState) => {
      set((state) => ({
        currentRoom: state.currentRoom?.id === room.id ? room : state.currentRoom,
        rooms: state.rooms.map((r) => (r.id === room.id ? room : r))
      }));
    });
    socket.on("announcement", (payload) => {
      console.log("ANNOUNCEMENT", payload);
    });
    set({ socket });
  },
  async fetchRooms() {
    const { data } = await api.get("/rooms");
    set({ rooms: data.rooms });
  },
  async createRoom(payload) {
    const { data } = await api.post("/rooms", payload ?? {});
    set({ currentRoom: data.room });
  },
  async joinRoom(roomId) {
    const { data } = await api.post(`/rooms/${roomId}/join`);
    set({ currentRoom: data.room });
    get().socket?.emit("room:join", roomId);
  },
  async addBot(roomId) {
    const { data } = await api.post(`/rooms/${roomId}/bots`);
    set({ currentRoom: data.room });
  },
  async startRoom(roomId) {
    const { data } = await api.post(`/rooms/${roomId}/start`);
    set({ currentRoom: data.room });
  },
  async advanceRoom(roomId) {
    const { data } = await api.post(`/rooms/${roomId}/advance`);
    set({ currentRoom: data.room });
  },
  async sendAction(roomId, action) {
    await api.post(`/rooms/${roomId}/action`, action);
  },
  async vote(roomId, targetId) {
    await api.post(`/rooms/${roomId}/vote`, { targetId });
  }
}));
