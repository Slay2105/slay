import { PlayerProfile } from "../types";
import { MASOI_ASSETS } from "../data/masoiManifest";

interface Props {
  profile: PlayerProfile;
}

const MAX_LEVEL_XP = 500;
const ASSET_MAP = MASOI_ASSETS.reduce<Record<string, (typeof MASOI_ASSETS)[number]>>(
  (acc, asset) => {
    acc[asset.id] = asset;
    return acc;
  },
  {}
);
const DEFAULT_SKIN = ASSET_MAP["danlang"] ?? MASOI_ASSETS[0]!;

const ProfilePanel = ({ profile }: Props) => {
  const progress = Math.min((profile.xp % MAX_LEVEL_XP) / MAX_LEVEL_XP, 1);
  const equipped = profile.equippedSkin ? ASSET_MAP[profile.equippedSkin] : undefined;
  const preview = equipped ?? DEFAULT_SKIN;
  return (
    <div className="panel profile-panel">
      <div className="panel-header">
        <div>
          <p className="panel-label">HỒ SƠ</p>
          <h2>{profile.username}</h2>
        </div>
        <span className="badge">LV {profile.level}</span>
      </div>
      <div className="profile-avatar">
        {preview && <img src={preview.asset} alt={preview.name} />}
        <div>
          <strong>{preview?.name ?? "Skin mặc định"}</strong>
          <small>ID: {preview?.id ?? "n/a"}</small>
        </div>
      </div>
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="xp-text">{profile.xp} / {MAX_LEVEL_XP} XP</p>
      <div className="stats-grid">
        <div>
          <p>Thắng</p>
          <strong>{profile.wins}</strong>
        </div>
        <div>
          <p>Thua</p>
          <strong>{profile.losses}</strong>
        </div>
        <div>
          <p>Coin</p>
          <strong>{profile.coins}</strong>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
