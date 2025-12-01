import { ROLE_DEFINITIONS } from "../data/roles";
import { RoleDefinition } from "../types";

const byName = new Map(ROLE_DEFINITIONS.map((role) => [role.name, role]));

const pickRandomUnique = <T>(pool: T[], count: number): T[] => {
  const source = [...pool];
  const picks: T[] = [];
  while (picks.length < count && source.length) {
    const index = Math.floor(Math.random() * source.length);
    picks.push(source.splice(index, 1)[0]);
  }
  return picks;
};

export const generateDefaultRoleSet = (totalPlayers = 16): RoleDefinition[] => {
  const roles: RoleDefinition[] = [];
  const wolvesPool = ROLE_DEFINITIONS.filter(
    (role) => role.type === "MaSoi" && role.name !== "Sói Tiên Tri"
  );
  roles.push(...pickRandomUnique(wolvesPool, 3));
  const wolfSeer = byName.get("Sói Tiên Tri");
  if (wolfSeer) roles.push(wolfSeer);
  const seer = byName.get("Tiên Tri");
  if (seer) roles.push(seer);

  const villagerPool = ROLE_DEFINITIONS.filter(
    (role) => role.type === "Dan" && role.name !== "Tiên Tri"
  );
  const villagerPicks = pickRandomUnique(villagerPool, 7);
  roles.push(...villagerPicks);

  const mediumCandidates = ["Thầy Đồng", "Thầy Bói"].map((name) => byName.get(name)).filter(Boolean) as RoleDefinition[];
  if (mediumCandidates.length) {
    roles.push(mediumCandidates[Math.floor(Math.random() * mediumCandidates.length)]);
  }

  const protectorNames = ["Bảo Vệ", "Thợ Săn Quái Thú", "Bác Sĩ"];
  const protectorPool = protectorNames
    .map((name) => byName.get(name))
    .filter(Boolean) as RoleDefinition[];
  if (protectorPool.length) {
    roles.push(
      protectorPool[Math.floor(Math.random() * protectorPool.length)]
    );
  }

  const neutralNames = [
    "Tin Tặc",
    "Kẻ Phóng Hỏa",
    "Sát Nhân Hàng Loạt"
  ];
  const neutralPool = neutralNames
    .map((name) => byName.get(name))
    .filter(Boolean) as RoleDefinition[];
  roles.push(...pickRandomUnique(neutralPool, 2));

  while (roles.length < totalPlayers) {
    const filler = villagerPool[Math.floor(Math.random() * villagerPool.length)];
    roles.push(filler);
  }
  return roles.slice(0, totalPlayers);
};
