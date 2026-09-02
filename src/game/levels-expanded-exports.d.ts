import type { LevelDef as LevelDefType, Plat as PlatType } from "./levels";

declare module "@/game/levels-expanded" {
  export type LevelDef = LevelDefType;
  export type Plat = PlatType;
}
