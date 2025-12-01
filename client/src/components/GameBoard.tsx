import { useMemo, useState } from "react";
import { GameRoomState } from "../types";
import { useRoomStore } from "../store/useRoom";
import { useAuthStore } from "../store/useAuth";

interface Props {
  room?: GameRoomState;
}

const avatarFromName = (name: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}`;

const GameBoard = ({ room }: Props) => {
  const { profile } = useAuthStore();
  const roomActions = useRoomStore();
  const [actionType, setActionType] = useState<"inspect" | "protect" | "kill">("inspect");
  const [targetId, setTargetId] = useState<string | undefined>();
  const [chat, setChat] = useState("");

  const mySlot = useMemo(
    () => room?.players.find((slot) => slot.profile.id === profile?.id),
    [room, profile]
  );

  const canAct = room && mySlot && room.phase === "night";
  const canVote = room && mySlot && room.phase === "vote";

  const handleAction = async () => {
    if (!room || !targetId) return;
    await roomActions.sendAction(room.id, { type: actionType, targetId });
  };

  const handleVote = async () => {
    if (!room || !targetId) return;
    await roomActions.vote(room.id, targetId);
  };

  const aliveCount = room?.players.filter((slot) => slot.alive).length ?? 0;

  return (
    <div className="game-board">
      <div className="board-header">
        <div>
          <p className="phase-tag">{room?.phase?.toUpperCase() ?? "LOBBY"}</p>
          <h3>{room?.name ?? "Chưa vào phòng"}</h3>
          <span>Ngày {room?.day ?? 0} • {aliveCount}/16 người sống</span>
        </div>
        {room && (
          <div className="board-actions">
            <button onClick={() => roomActions.addBot(room.id)}>+ Bot</button>
            <button onClick={() => roomActions.startRoom(room.id)}>Bắt đầu</button>
            <button onClick={() => roomActions.advanceRoom(room.id)}>Đổi pha</button>
          </div>
        )}
      </div>
      <div className="board-content">
        <div className="player-grid">
          {room?.players.map((slot, index) => (
            <div key={slot.id} className={`player-card ${!slot.alive ? "dead" : ""}`}>
              <div className="player-rank">{index + 1}</div>
              <img src={avatarFromName(slot.profile.username)} alt={slot.profile.username} />
              <strong>{slot.profile.username}</strong>
              {slot.role && room.phase !== "lobby" && (
                <small>{slot.role.name}</small>
              )}
            </div>
          ))}
          {!room && <p className="empty-state">Tạo phòng để bắt đầu trận 16 người.</p>}
        </div>
        <div className="side-panel">
          <div className="action-panel">
            <div className="action-header">
              <p>Chức năng</p>
              <span>{mySlot?.role?.name ?? "Chưa có"}</span>
            </div>
            <div className="action-controls">
              <select value={actionType} onChange={(e) => setActionType(e.target.value as any)}>
                <option value="inspect">Soi</option>
                <option value="protect">Bảo vệ</option>
                <option value="kill">Tấn công</option>
              </select>
              <select value={targetId ?? ""} onChange={(e) => setTargetId(e.target.value)}>
                <option value="">Chọn mục tiêu</option>
                {room?.players.filter((slot) => slot.alive).map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.profile.username}
                  </option>
                ))}
              </select>
              <button disabled={!canAct} onClick={handleAction}>
                Kích hoạt
              </button>
              <button disabled={!canVote} onClick={handleVote}>
                Bỏ phiếu
              </button>
            </div>
          </div>
          <div className="chat-panel">
            <div className="chat-header">
              <span>Chat & Nhật ký</span>
              <button type="button">⚙️</button>
            </div>
            <div className="chat-log">
              {room?.eventLog.slice(-8).map((line, idx) => (
                <p key={`${line}-${idx}`}>{line}</p>
              ))}
            </div>
            <div className="chat-input">
              <input
                value={chat}
                onChange={(e) => setChat(e.target.value)}
                placeholder="Nhập tin nhắn..."
              />
              <button type="button">Gửi</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
