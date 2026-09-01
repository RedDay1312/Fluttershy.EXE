export type DeskFile = {
  id: string;
  labelKey: string;
  kind: "note" | "folder" | "sys" | "exe" | "img";
  textKey?: string;
};

export type HauntState = {
  stage: number;
  files: DeskFile[];
  sticky: string[];
  recycle: string[];
  ponyWalk: boolean;
  eyes: boolean;
  bleed: boolean;
  webcam: boolean;
  browser: boolean;
  clockStuck: boolean;
  iconsScatter: boolean;
  typingKey: string | null;
  fakeWindows: number;
  taskmgr: boolean;
};

export const EMPTY_HAUNT: HauntState = {
  stage: 0,
  files: [],
  sticky: [],
  recycle: [],
  ponyWalk: false,
  eyes: false,
  bleed: false,
  webcam: false,
  browser: false,
  clockStuck: false,
  iconsScatter: false,
  typingKey: null,
  fakeWindows: 0,
  taskmgr: false,
};

/**
 * Desktop corruption is deliberately staged. Each stage introduces one
 * new idea instead of dumping every horror effect on the player at once.
 * Old Angel/crossover content is intentionally gone.
 */
export function hauntFor(stage: number): HauntState {
  const level = Math.max(0, Math.min(6, Math.floor(stage)));
  if (level === 0) return { ...EMPTY_HAUNT };

  const files: DeskFile[] = [];
  const sticky: string[] = [];
  const recycle: string[] = [];

  // 1 — the game starts remembering the player.
  files.push(
    { id: "cottage", labelKey: "file.cottage", kind: "note", textKey: "desk.type.1" },
    { id: "twilight", labelKey: "file.twilight", kind: "note", textKey: "note.10" },
  );
  sticky.push("sticky.1");

  // 2 — the world begins watching back.
  if (level >= 2) {
    files.push({ id: "blink", labelKey: "file.blink", kind: "note", textKey: "desk.type.2" });
    sticky.push("sticky.2");
  }

  // 3 — familiar things disappear from the save instead of becoming random NPCs.
  if (level >= 3) {
    files.push({ id: "friends", labelKey: "file.friends", kind: "folder" });
    sticky.push("sticky.3");
    recycle.push("rainbow_dash.dat", "twilight_sparkle.dat", "pinkie_pie.dat", "rarity.dat", "applejack.dat");
  }

  // 4 — the game itself becomes aware that something is wrong.
  if (level >= 4) {
    files.push({ id: "sys", labelKey: "file.sys", kind: "sys", textKey: "desk.type.4" });
    sticky.push("sticky.4");
  }

  // 5 — direct observation, reserved for the late game.
  if (level >= 5) {
    files.push({ id: "cam", labelKey: "file.cam", kind: "exe" });
    sticky.push("sticky.5");
  }

  // 6 — the game stops pretending the player is outside the story.
  if (level >= 6) {
    files.push({ id: "you", labelKey: "file.you", kind: "exe" });
    sticky.push("sticky.6");
  }

  return {
    stage: level,
    files,
    sticky,
    recycle,
    ponyWalk: level >= 4,
    eyes: level >= 2,
    bleed: level >= 3,
    webcam: level >= 5,
    browser: level >= 5,
    clockStuck: level >= 4,
    iconsScatter: level >= 5,
    typingKey: level >= 1 && level <= 6 ? `desk.type.${level}` : null,
    fakeWindows: level >= 5 ? Math.min(2, level - 3) : 0,
    taskmgr: level >= 4,
  };
}
