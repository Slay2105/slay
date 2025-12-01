import { useEffect, useMemo } from "react";
import AuthPanel from "./components/AuthPanel";
import ProfilePanel from "./components/ProfilePanel";
import AvatarPicker from "./components/AvatarPicker";
import Leaderboard from "./components/Leaderboard";
import LobbyList from "./components/LobbyList";
import ShopPanel from "./components/ShopPanel";
import GameBoard from "./components/GameBoard";
import { useAuthStore } from "./store/useAuth";
import { useRoomStore } from "./store/useRoom";
import api from "./lib/api";

import "./App.css";

const App = () => {
  const { profile, hydrate, logout } = useAuthStore();
  const { connect, currentRoom } = useRoomStore();

  useEffect(() => {
    hydrate();
    connect();
  }, []);

  const leaderboard = useMemo(() => {
    if (!profile) return [];
    return [
      profile,
      {
        ...profile,
        id: "ai-haley",
        username: "7 HaleyCutie",
        wins: profile.wins + 12,
        level: profile.level + 1
      },
      {
        ...profile,
        id: "ai-ohio",
        username: "1 OhioKid",
        wins: profile.wins + 5,
        level: profile.level
      }
    ];
  }, [profile]);

  const ownedSkins = useMemo(() => {
    if (!profile) return [];
    const base = profile.skins.length ? profile.skins : ["danlang"];
    return Array.from(new Set(base));
  }, [profile]);

  const handleEquipSkin = async (skinId: string) => {
    await api.post("/profile/equip", { skinId });
    await hydrate();
  };

  if (!profile) {
    return (
      <div className="landing">
        <div className="landing-preview">
          <div className="mock-grid">
            {Array.from({ length: 9 }).map((_, idx) => (
              <div key={idx} className="mock-avatar" />
            ))}
          </div>
          <p>Giao diện lựa chọn avatar và skin giống Wolvesville</p>
        </div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>Wolvesville Online</h1>
          <p>Multiplayer + Bot test + Skin shop</p>
        </div>
        <button onClick={logout}>Đăng xuất</button>
      </header>
      <main className="app-body">
        <section className="column-left">
          <ProfilePanel profile={profile} />
          <AvatarPicker
            ownedSkins={ownedSkins}
            equipped={profile.equippedSkin}
            onEquip={handleEquipSkin}
          />
          <Leaderboard players={leaderboard} />
          <ShopPanel />
        </section>
        <section className="column-right">
          {currentRoom ? <GameBoard room={currentRoom} /> : <LobbyList />}
        </section>
      </main>
    </div>
  );
};

export default App;
