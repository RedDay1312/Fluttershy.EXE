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

export function hauntFor(stage: number): HauntState {
  if (stage <= 0) return { ...EMPTY_HAUNT };
  const files: DeskFile[] = [];
  const sticky: string[] = [];
  const recycle: string[] = [];

  if (stage >= 1) {
    files.push({ id: "cottage", labelKey: "file.cottage", kind: "note", textKey: "desk.type.1" });
    files.push({ id: "twilight", labelKey: "file.twilight", kind: "note", textKey: "note.10" });
    sticky.push("sticky.1");
  }
  if (stage >= 2) {
    files.push({ id: "blink", labelKey: "file.blink", kind: "note", textKey: "desk.type.2" });
    files.push({ id: "angel", labelKey: "file.angel", kind: "img" });
    sticky.push("sticky.2");
    recycle.push("angel.bmp");
  }
  if (stage >= 3) {
    files.push({ id: "friends", labelKey: "file.friends", kind: "folder" });
    sticky.push("sticky.3");
    recycle.push("rainbow_dash.dat", "twilight_sparkle.dat", "pinkie_pie.dat", "rarity.dat", "applejack.dat");
  }
  if (stage >= 4) {
    files.push({ id: "sys", labelKey: "file.sys", kind: "sys", textKey: "desk.type.4" });
    sticky.push("sticky.4");
  }
  if (stage >= 5) {
    files.push({ id: "cam", labelKey: "file.cam", kind: "exe" });
    sticky.push("sticky.5");
  }
  if (stage >= 6) {
    files.push({ id: "you", labelKey: "file.you", kind: "exe" });
    sticky.push("sticky.6");
  }

  return {
    stage,
    files,
    sticky,
    recycle,
    ponyWalk: stage >= 4,
    eyes: stage >= 2,
    bleed: stage >= 3,
    webcam: stage >= 5,
    browser: stage >= 5,
    clockStuck: stage >= 4,
    iconsScatter: stage >= 5,
    typingKey: stage >= 1 && stage <= 6 ? `desk.type.${stage}` : null,
    fakeWindows: stage >= 5 ? 3 : 0,
    taskmgr: stage >= 4,
  };
}
