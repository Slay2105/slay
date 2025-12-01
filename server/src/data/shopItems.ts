import { InventoryItem } from "../types";

export const SHOP_ITEMS: InventoryItem[] = [
  {
    id: "skin_basic_forest",
    name: "Forest Ranger",
    price: 500,
    type: "skin",
    rarity: "common",
    asset: "data/skins/ranger.png",
    description: "Trang phục rừng cơ bản với nền xanh lá."
  },
  {
    id: "skin_sparkle_mage",
    name: "Sparkle Mage",
    price: 1200,
    type: "skin",
    rarity: "epic",
    asset: "data/skins/sparkle.png",
    description: "Phù thủy phát sáng với hiệu ứng cực đẹp."
  },
  {
    id: "effect_vote_flash",
    name: "Hiệu ứng Vote",
    price: 700,
    type: "effect",
    rarity: "rare",
    asset: "effects/vote-flash.json",
    description: "Phát sáng khi bỏ phiếu hoặc bị treo cổ."
  },
  {
    id: "bundle_start_pack",
    name: "Gói Khởi Đầu",
    price: 1500,
    type: "bundle",
    rarity: "rare",
    asset: "bundle/start.png",
    description: "Bao gồm 1 skin thường + 1 hiệu ứng vote."
  }
];
