export type RoleFaction =
  | "Dan"
  | "MaSoi"
  | "DocLap"
  | "DoiPhe";

export type Alignment = "Thien" | "Ac" | "KhongRo";

export interface RoleDefinition {
  name: string;
  type: RoleFaction;
  alignment: Alignment;
  description: string;
  asset: string;
  tags?: string[];
  oncePerGame?: boolean;
}

export type Phase = "lobby" | "night" | "day" | "vote" | "ended";

export interface InventoryItem {
  id: string;
  name: string;
  price: number;
  type: "skin" | "effect" | "bundle";
  rarity: "common" | "rare" | "epic" | "legendary";
  asset: string;
  description?: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  email: string;
  level: number;
  xp: number;
  coins: number;
  wins: number;
  losses: number;
  skins: string[];
  effects: string[];
  equippedSkin?: string;
  equippedEffect?: string;
  isAdmin?: boolean;
}

export interface PlayerSlot {
  id: string;
  profile: PlayerProfile;
  role?: RoleDefinition;
  alive: boolean;
  isBot: boolean;
  status: "idle" | "performing" | "waiting";
  mutedUntil?: number;
  silenced?: boolean;
  jailed?: boolean;
  meta?: Record<string, any>;
}

export interface GameRoomOptions {
  name: string;
  maxPlayers: number;
  hostId: string;
  isRanked: boolean;
  allowBots: boolean;
  backgroundTheme?: string;
}

export interface GameRoomState {
  id: string;
  name: string;
  options: GameRoomOptions;
  players: PlayerSlot[];
  hostId: string;
  createdAt: number;
  phase: Phase;
  day: number;
  voteLog: VoteRecord[];
  eventLog: string[];
  winner?: string;
}

export interface VoteRecord {
  voterId: string;
  targetId: string;
  phase: Phase;
  timestamp: number;
}

export interface BotPersona {
  id: string;
  displayName: string;
  aggression: number;
  honesty: number;
  bluffChance: number;
}

export type SocketEvent =
  | { type: "room:update"; payload: GameRoomState }
  | { type: "chat"; payload: { roomId: string; senderId: string; text: string } }
  | { type: "animation"; payload: { roomId: string; effect: string; targetId?: string } };
