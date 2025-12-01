interface AvatarItem {
  id: string;
  name: string;
  image: string;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const AVATAR_LIBRARY: AvatarItem[] = [
  {
    id: "pink-angel",
    name: "Thiên sứ",
    rarity: "epic",
    image: "https://api.dicebear.com/9.x/adventurer/svg?seed=Angel"
  },
  {
    id: "ice-mage",
    name: "Băng Pháp",
    rarity: "rare",
    image: "https://api.dicebear.com/9.x/adventurer/svg?seed=FrostMage"
  },
  {
    id: "forest-guardian",
    name: "Lâm Vệ",
    rarity: "common",
    image: "https://api.dicebear.com/9.x/adventurer/svg?seed=Guardian"
  },
  {
    id: "shadow-hunter",
    name: "Thợ Săn",
    rarity: "legendary",
    image: "https://api.dicebear.com/9.x/adventurer/svg?seed=Shadow"
  }
];

interface Props {
  ownedSkins: string[];
  equipped?: string;
  onEquip?: (skinId: string) => void;
}

const AvatarPicker = ({ ownedSkins, equipped, onEquip }: Props) => {
  const visible = AVATAR_LIBRARY.filter((item) =>
    ownedSkins.includes(item.id) || item.rarity === "common"
  );
  return (
    <div className="panel avatar-picker">
      <div className="panel-header">
        <p className="panel-label">HÌNH ĐẠI DIỆN</p>
      </div>
      <div className="avatar-grid">
        {visible.map((avatar) => (
          <button
            type="button"
            key={avatar.id}
            className={`avatar-card ${equipped === avatar.id ? "selected" : ""}`}
            onClick={() => onEquip?.(avatar.id)}
          >
            <img src={avatar.image} alt={avatar.name} />
            <span>{avatar.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AvatarPicker;
