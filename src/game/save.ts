import type { Lang } from "./i18n";

export const SAVE_VERSION = 2;
const KEY = "waiting.exe.save";

export type EndingId = "escape" | "merge" | "loop" | "kind";

export type SaveData = {
  version: number;
  lang: Lang;
  level: number;
  notes: string[];
  butterflies: number;
  marks: number;
  closeAttempts: number;
  skippedLines: number;
  listenedLines: number;
  deaths: number;
  music: boolean;
  sfx: boolean;
  saveLabel: "ok" | "wait" | "empty" | "fog" | "blood";
  seenIntro: boolean;
  checkpoint: { level: number; x: number; y: number } | null;
  hauntStage: number;
  angelGone: boolean;
};

export const defaultSave = (): SaveData => ({
  version: SAVE_VERSION,
  lang: "ru",
  level: 1,
  notes: [],
  butterflies: 0,
  marks: 0,
  closeAttempts: 0,
  skippedLines: 0,
  listenedLines: 0,
  deaths: 0,
  music: true,
  sfx: true,
  saveLabel: "ok",
  seenIntro: false,
  checkpoint: null,
  hauntStage: 0,
  angelGone: false,
});

function migrate(raw: SaveData): SaveData {
  const base = defaultSave();
  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    marks: raw.marks ?? 0,
    hauntStage: raw.hauntStage ?? (raw.level > 1 ? raw.level - 1 : 0),
    angelGone: raw.angelGone ?? false,
    notes: Array.isArray(raw.notes) ? raw.notes : [],
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as SaveData;
    return migrate(parsed);
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: SAVE_VERSION }));
  } catch {
    /* private mode */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function pickEnding(s: SaveData): EndingId {
  const notes = s.notes.length;
  if (s.butterflies >= 8 && s.listenedLines >= 10 && notes >= 10 && s.closeAttempts >= 1) return "kind";
  if (s.closeAttempts >= 2 && notes >= 6) return "escape";
  if (s.closeAttempts === 0 && s.skippedLines >= 5) return "merge";
  if (notes <= 2 && s.listenedLines < 3) return "merge";
  return "loop";
}
