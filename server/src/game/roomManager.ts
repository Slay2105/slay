import { EventEmitter } from "events";
import { v4 as uuid } from "uuid";
import {
  ChatMessage,
  GameRoomOptions,
  GameRoomState,
  PlayerProfile,
  PlayerSlot,
  Phase,
  VoteRecord
} from "../types";
import { generateDefaultRoleSet } from "./roleAllocator";
import {
  botNightDecision,
  botVoteDecision,
  BOT_PERSONAS
} from "./botLogic";

interface PendingAction {
  type: "kill" | "protect" | "inspect" | "vote";
  targetId: string;
}

class GameRoom extends EventEmitter {
  state: GameRoomState;
  private pendingActions = new Map<string, PendingAction>();
  private currentVotes = new Map<string, string>();

  constructor(options: GameRoomOptions) {
    super();
    this.state = {
      id: uuid(),
      name: options.name,
      options,
      players: [],
      hostId: options.hostId,
      createdAt: Date.now(),
      phase: "lobby",
      day: 0,
      voteLog: [],
      eventLog: [],
      chatLog: []
    };
  }

  addPlayer(profile: PlayerProfile, isBot = false) {
    if (this.state.players.find((slot) => slot.profile.id === profile.id)) {
      return this.state;
    }
    if (this.state.players.length >= this.state.options.maxPlayers) {
      throw new Error("Phòng đã đầy");
    }
    const slot: PlayerSlot = {
      id: uuid(),
      profile,
      alive: true,
      isBot,
      status: "idle",
      meta: {}
    };
    this.state.players.push(slot);
    this.addChat(null, `${profile.username} đã vào phòng`, "system");
    this.emitUpdate();
    return this.state;
  }

  addRandomBot() {
    const persona =
      BOT_PERSONAS[Math.floor(Math.random() * BOT_PERSONAS.length)];
    const profile: PlayerProfile = {
      id: `${persona.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: persona.displayName,
      email: `${persona.id}@bots`,
      level: 1,
      xp: 0,
      coins: 0,
      wins: 0,
      losses: 0,
      skins: [],
      effects: [],
      isAdmin: false
    };
    return this.addPlayer(profile, true);
  }

  queueAction(slotId: string, action: PendingAction) {
    this.pendingActions.set(slotId, action);
  }

  addChat(slotId: string | null, text: string, type: ChatMessage["type"] = "player") {
    const sender =
      slotId !== null
        ? this.state.players.find((slot) => slot.id === slotId)
        : undefined;
    const entry: ChatMessage = {
      id: uuid(),
      senderId: sender?.id,
      senderName: sender?.profile.username ?? "Hệ thống",
      text,
      type,
      createdAt: Date.now()
    };
    this.state.chatLog.push(entry);
    if (this.state.chatLog.length > 100) {
      this.state.chatLog.shift();
    }
    this.emitUpdate();
  }

  submitVote(slotId: string, targetId: string) {
    this.currentVotes.set(slotId, targetId);
    this.state.voteLog.push({
      voterId: slotId,
      targetId,
      phase: "vote",
      timestamp: Date.now()
    });
    this.emitUpdate();
  }

  startGame() {
    if (this.state.players.length < this.state.options.maxPlayers) {
      const need = this.state.options.maxPlayers - this.state.players.length;
      for (let i = 0; i < need && this.state.options.allowBots; i++) {
        this.addRandomBot();
      }
    }
    if (this.state.players.length < 5) {
      throw new Error("Cần ít nhất 5 người để bắt đầu");
    }
    const roles = generateDefaultRoleSet(this.state.players.length);
    this.state.players.forEach((slot, index) => {
      slot.role = roles[index];
      slot.alive = true;
      slot.meta = {};
    });
    this.state.phase = "night";
    this.state.day = 1;
    this.state.eventLog.push("Trò chơi bắt đầu. Đêm 1 bắt đầu!");
    this.addChat(null, "Đêm 1 bắt đầu - hãy dùng chức năng của bạn!", "system");
    this.emitUpdate();
  }

  advancePhase() {
    const currentPhase = this.state.phase;
    switch (currentPhase) {
      case "night":
        this.resolveNight();
        this.state.phase = "day";
        this.state.eventLog.push(`Bình minh Ngày ${this.state.day}`);
        this.addChat(null, `Ngày ${this.state.day} bắt đầu - bàn luận thôi!`, "system");
        break;
      case "day":
        this.state.phase = "vote";
        this.state.eventLog.push("Bắt đầu bỏ phiếu");
        this.addChat(null, "Mở vote! Chọn người bị treo cổ.", "system");
        break;
      case "vote": {
        this.resolveVote();
        if (this.state.phase === "ended") {
          break;
        }
        this.state.phase = "night";
        this.state.day += 1;
        this.state.eventLog.push(`Đêm ${this.state.day} bắt đầu`);
        this.addChat(null, `Đêm ${this.state.day} tràn về - hãy cẩn thận!`, "system");
        break;
      }
      default:
        break;
    }
    this.emitUpdate();
  }

  private resolveNight() {
    const actions = new Map(this.pendingActions);
    this.pendingActions.clear();
    this.state.players
      .filter((slot) => slot.isBot && slot.alive && slot.role)
      .forEach((slot) => {
        if (!actions.has(slot.id)) {
          const decision = botNightDecision(this.state, slot);
          if (decision) {
            actions.set(slot.id, decision);
          }
        }
      });
    const protections = new Set<string>();
    const inspections: VoteRecord[] = [];
    const killVotes = new Map<string, number>();
    actions.forEach((action, actorId) => {
      switch (action.type) {
        case "protect":
          protections.add(action.targetId);
          break;
        case "inspect":
          inspections.push({
            voterId: actorId,
            targetId: action.targetId,
            phase: "night",
            timestamp: Date.now()
          });
          break;
        case "kill":
          killVotes.set(
            action.targetId,
            (killVotes.get(action.targetId) ?? 0) + 1
          );
          break;
      }
    });
    if (inspections.length) {
      inspections.forEach((entry) => {
        const target = this.state.players.find(
          (slot) => slot.id === entry.targetId
        );
        const actor = this.state.players.find((slot) => slot.id === entry.voterId);
        if (target && actor) {
          this.state.eventLog.push(
            `${actor.profile.username} soi ${target.profile.username} và thấy phe ${target.role?.alignment ?? "??"}`
          );
        }
      });
    }
    if (killVotes.size) {
      const [targetId] = [...killVotes.entries()].sort((a, b) => b[1] - a[1])[0];
      if (protections.has(targetId)) {
        this.state.eventLog.push(
          `Mục tiêu bị tấn công nhưng được bảo vệ an toàn`
        );
        this.addChat(null, "Đêm qua có tiếng la hét nhưng không ai chết.", "system");
      } else {
        const victim = this.state.players.find((slot) => slot.id === targetId);
        if (victim) {
          victim.alive = false;
          this.state.eventLog.push(
            `${victim.profile.username} đã bị giết trong đêm!`
          );
          this.addChat(null, `${victim.profile.username} bị sói xé xác!`, "system");
        }
      }
    } else {
      this.state.eventLog.push("Đêm yên bình, không ai chết");
      this.addChat(null, "Đêm yên bình, không ai hy sinh.", "system");
    }
    this.checkWinner();
  }

  private resolveVote() {
    this.state.players
      .filter((slot) => slot.isBot && slot.alive)
      .forEach((slot) => {
        if (!this.currentVotes.has(slot.id)) {
          const decision = botVoteDecision(this.state, slot);
          if (decision) {
            this.currentVotes.set(slot.id, decision.targetId);
          }
        }
      });
    const tally = new Map<string, number>();
    this.currentVotes.forEach((targetId, voterId) => {
      const voter = this.state.players.find((slot) => slot.id === voterId);
      if (!voter?.alive) return;
      tally.set(targetId, (tally.get(targetId) ?? 0) + 1);
    });
    this.currentVotes.clear();
    if (!tally.size) {
      this.state.eventLog.push("Không ai bị treo cổ");
      return;
    }
    const sorted = [...tally.entries()].sort((a, b) => b[1] - a[1]);
    const [targetId, votes] = sorted[0];
    const tie = sorted.length > 1 && sorted[1][1] === votes;
    if (tie) {
      this.state.eventLog.push("Phiếu hòa, không ai chết");
      return;
    }
    const victim = this.state.players.find((slot) => slot.id === targetId);
    if (victim) {
      victim.alive = false;
      this.state.eventLog.push(
        `${victim.profile.username} bị treo cổ với ${votes} phiếu`
      );
      this.addChat(null, `${victim.profile.username} bị dân làng xử treo cổ.`, "system");
    }
    this.checkWinner();
  }

  private checkWinner() {
    const alive = this.state.players.filter((slot) => slot.alive);
    const wolves = alive.filter((slot) => slot.role?.type === "MaSoi");
    const villagers = alive.filter((slot) => slot.role?.type === "Dan");
    if (!wolves.length) {
      this.state.winner = "Dan";
      this.state.phase = "ended";
      this.state.eventLog.push("Phe Dân đã chiến thắng!");
      return;
    }
    if (wolves.length >= alive.length - wolves.length) {
      this.state.winner = "MaSoi";
      this.state.phase = "ended";
      this.state.eventLog.push("Ma Sói đã áp đảo và chiến thắng!");
      return;
    }
    if (!villagers.length && alive.length === wolves.length) {
      this.state.winner = "MaSoi";
      this.state.phase = "ended";
    }
  }

  private emitUpdate() {
    this.emit("update", this.state);
  }
}

export class RoomManager extends EventEmitter {
  private rooms = new Map<string, GameRoom>();

  createRoom(hostProfile: PlayerProfile, options?: Partial<GameRoomOptions>) {
    const room = new GameRoom({
      name: options?.name ?? `${hostProfile.username}'s room`,
      maxPlayers: options?.maxPlayers ?? 16,
      hostId: hostProfile.id,
      isRanked: options?.isRanked ?? false,
      allowBots: options?.allowBots ?? true,
      backgroundTheme: options?.backgroundTheme ?? "mountain"
    });
    room.addPlayer(hostProfile, false);
    room.on("update", (state) => this.emit("update", state));
    this.rooms.set(room.state.id, room);
    this.emit("created", room.state);
    return room.state;
  }

  listRooms() {
    return [...this.rooms.values()].map((room) => room.state);
  }

  getRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error("Phòng không tồn tại");
    return room;
  }

  joinRoom(roomId: string, profile: PlayerProfile) {
    const room = this.getRoom(roomId);
    return room.addPlayer(profile, false);
  }

  addBot(roomId: string) {
    const room = this.getRoom(roomId);
    return room.addRandomBot();
  }

  startRoom(roomId: string) {
    const room = this.getRoom(roomId);
    room.startGame();
    return room.state;
  }

  advance(roomId: string) {
    const room = this.getRoom(roomId);
    room.advancePhase();
    return room.state;
  }

  queueAction(roomId: string, playerId: string, action: PendingAction) {
    const room = this.getRoom(roomId);
    room.queueAction(playerId, action);
  }

  vote(roomId: string, playerId: string, targetId: string) {
    const room = this.getRoom(roomId);
    room.submitVote(playerId, targetId);
  }

  chat(roomId: string, playerId: string, text: string) {
    const room = this.getRoom(roomId);
    const slot = room.state.players.find((player) => player.id === playerId);
    if (!slot) {
      throw new Error("Không tìm thấy người chơi");
    }
    if (!text.trim()) {
      throw new Error("Tin nhắn trống");
    }
    room.addChat(playerId, text.trim());
  }
}
