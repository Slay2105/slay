import { PlayerProfile } from "../types";

interface Props {
  players: PlayerProfile[];
}

const Leaderboard = ({ players }: Props) => {
  return (
    <div className="panel leaderboard">
      <div className="panel-header">
        <p className="panel-label">BẢNG XẾP HẠNG</p>
      </div>
      <ul>
        {players.map((player, index) => (
          <li key={player.id}>
            <span className="rank">{index + 1}</span>
            <div>
              <strong>{player.username}</strong>
              <p>{player.wins} thắng • Lv {player.level}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
