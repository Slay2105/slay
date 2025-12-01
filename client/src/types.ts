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

export interface RoleDefinition {
  name: string;
  description: string;
  type: "Dan" | "MaSoi" | "DocLap" | "DoiPhe";
  alignment: "Thien" | "Ac" | "KhongRo";
  asset: string;
}

export interface PlayerSlot {
  id: string;
  profile: PlayerProfile;
  role?: RoleDefinition;
  alive: boolean;
  isBot: boolean;
  status: string;
}

export interface GameRoomState {
  id: string;
  name: string;
  hostId: string;
  createdAt: number;
  options: {
    name: string;
    maxPlayers: number;
    hostId: string;
    isRanked: boolean;
    allowBots: boolean;
    backgroundTheme?: string;
  };
  players: PlayerSlot[];
  phase: "lobby" | "night" | "day" | "vote" | "ended";
  day: number;
  eventLog: string[];
  chatLog: ChatMessage[];
  voteLog: VoteLogEntry[];
  winner?: string;
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName: string;
  text: string;
  createdAt: number;
  type: "system" | "player";
}

export interface VoteLogEntry {
  voterId: string;
  targetId: string;
  phase: string;
  timestamp: number;
}

export interface InventoryEntry {
  itemId: string;
  itemType: string;
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  type: "skin" | "effect" | "bundle";
  rarity: "common" | "rare" | "epic" | "legendary";
  asset: string;
  description?: string;
}
