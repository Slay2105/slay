import { useEffect } from "react";
import { useRoomStore } from "../store/useRoom";

const LobbyList = () => {
  const { rooms, fetchRooms, joinRoom, createRoom } = useRoomStore();

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="panel lobby-list">
      <div className="panel-header">
        <p className="panel-label">PHÒNG ĐANG MỞ</p>
        <button onClick={() => createRoom({})}>Tạo phòng</button>
      </div>
      <div className="lobby-grid">
        {rooms.map((room) => (
          <div key={room.id} className="lobby-card">
            <h4>{room.name}</h4>
            <p>
              {room.players.length}/{room.options.maxPlayers} người • {room.phase}
            </p>
            <button onClick={() => joinRoom(room.id)}>Tham gia</button>
          </div>
        ))}
        {!rooms.length && <p>Chưa có phòng, hãy tạo mới!</p>}
      </div>
    </div>
  );
};

export default LobbyList;
