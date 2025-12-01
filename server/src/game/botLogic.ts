import { GameRoomState, PlayerSlot, BotPersona } from "../types";

export const BOT_PERSONAS: BotPersona[] = [
  { id: "bot_haley", displayName: "HaleyCutie AI", aggression: 0.4, honesty: 0.8, bluffChance: 0.2 },
  { id: "bot_ohio", displayName: "OhioKid AI", aggression: 0.5, honesty: 0.6, bluffChance: 0.4 },
  { id: "bot_mountain", displayName: "Mountain7 AI", aggression: 0.7, honesty: 0.3, bluffChance: 0.6 }
];

type BotAction =
  | { type: "kill"; targetId: string }
  | { type: "protect"; targetId: string }
  | { type: "inspect"; targetId: string }
  | { type: "vote"; targetId: string };

const randomTarget = (room: GameRoomState, excludeId?: string) => {
  const candidates = room.players.filter(
    (slot) => slot.alive && slot.id !== excludeId
  );
  if (!candidates.length) return undefined;
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx].id;
};

export const botNightDecision = (
  room: GameRoomState,
  slot: PlayerSlot
): BotAction | null => {
  if (!slot.role) return null;
  switch (slot.role.name) {
    case "Ma Sói":
    case "Sói Đầu Đàn":
    case "Sói Ác Mộng":
    case "Sói Điên Cuồng":
    case "Sói Pháp Sư":
    case "Sói Mèo Con":
    case "Sói Bảo Hộ":
    case "Sói Hòa Bình":
    case "Sói Trẻ":
      return { type: "kill", targetId: randomTarget(room, slot.id) ?? slot.id };
    case "Sói Tiên Tri":
      return { type: "inspect", targetId: randomTarget(room, slot.id) ?? slot.id };
    case "Tiên Tri":
    case "Thầy Bói":
      return { type: "inspect", targetId: randomTarget(room, slot.id) ?? slot.id };
    case "Bác Sĩ":
    case "Bảo Vệ":
    case "Hoa Bé Con":
      return { type: "protect", targetId: randomTarget(room) ?? slot.id };
    case "Tin Tặc":
      return { type: "kill", targetId: randomTarget(room, slot.id) ?? slot.id };
    case "Kẻ Phóng Hỏa":
    case "Sát Nhân Hàng Loạt":
      return { type: "kill", targetId: randomTarget(room, slot.id) ?? slot.id };
    default:
      return null;
  }
};

export const botVoteDecision = (
  room: GameRoomState,
  slot: PlayerSlot
): BotAction | null => {
  const target = randomTarget(room, slot.id);
  if (!target) return null;
  return { type: "vote", targetId: target };
};
