import { MASOI_ASSETS } from "../data/masoiManifest";

interface Props {
  ownedSkins: string[];
  equipped?: string;
  onEquip?: (skinId: string) => void;
}

const AvatarPicker = ({ ownedSkins, equipped, onEquip }: Props) => {
  const ownedSet = new Set(ownedSkins);
  const ordered = MASOI_ASSETS.filter((item) => item.type !== "Extra");

  return (
    <div className="panel avatar-picker">
      <div className="panel-header">
        <div>
          <p className="panel-label">HÌNH ĐẠI DIỆN</p>
          <small>Nhấp vào skin bạn đã mở khóa để trang bị</small>
        </div>
      </div>
      <div className="avatar-grid">
        {ordered.map((avatar) => {
          const owned = ownedSet.has(avatar.id);
          const isActive = equipped === avatar.id;
          return (
            <button
              type="button"
              key={avatar.id}
              className={`avatar-card ${isActive ? "selected" : ""} ${owned ? "" : "locked"}`}
              onClick={() => owned && onEquip?.(avatar.id)}
              aria-label={`Skin ${avatar.name}`}
            >
              <img src={avatar.asset} alt={avatar.name} loading="lazy" />
              <div className="avatar-card__meta">
                <span>{avatar.name}</span>
                <small>{owned ? (isActive ? "Đang dùng" : "Đã mở khóa") : "Mở khóa tại shop"}</small>
              </div>
              <span className={`type-chip type-${avatar.type.toLowerCase()}`}>
                {avatar.type === "Dan" && "Dân"}
                {avatar.type === "MaSoi" && "Sói"}
                {avatar.type === "DocLap" && "Độc lập"}
                {avatar.type === "DoiPhe" && "Đổi phe"}
                {avatar.type === "Extra" && "Khác"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AvatarPicker;
