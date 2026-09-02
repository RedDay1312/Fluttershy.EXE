import type { Lang } from "./i18n";
import { endingFromStory } from "./story-state";

export const SAVE_VERSION = 4;
const KEY = "waiting.exe.save.v4";
const LEGACY_KEYS = ["waiting.exe.save", "waiting.exe.story.v1"] as const;

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

function normalize(raw: Partial<SaveData>): SaveData {
  const base = defaultSave();
  const level = Number.isFinite(raw.level) ? Math.min(7, Math.max(1, Math.floor(raw.level!))) : base.level;
  const checkpoint =
    raw.checkpoint &&
    Number.isFinite(raw.checkpoint.level) &&
    Number.isFinite(raw.checkpoint.x) &&
    Number.isFinite(raw.checkpoint.y)
      ? {
          level: Math.min(7, Math.max(1, Math.floor(raw.checkpoint.level))),
          x: raw.checkpoint.x,
          y: raw.checkpoint.y,
        }
      : null;
  const lang: Lang = raw.lang === "en" ? "en" : "ru";

  return {
    ...base,
    ...raw,
    version: SAVE_VERSION,
    lang,
    level,
    notes: Array.isArray(raw.notes) ? [...new Set(raw.notes.filter((v): v is string => typeof v === "string"))] : [],
    butterflies: Number.isFinite(raw.butterflies) ? Math.max(0, Math.floor(raw.butterflies!)) : base.butterflies,
    marks: Number.isFinite(raw.marks) ? Math.max(0, Math.floor(raw.marks!)) : base.marks,
    closeAttempts: Number.isFinite(raw.closeAttempts) ? Math.max(0, Math.floor(raw.closeAttempts!)) : base.closeAttempts,
    skippedLines: Number.isFinite(raw.skippedLines) ? Math.max(0, Math.floor(raw.skippedLines!)) : base.skippedLines,
    listenedLines: Number.isFinite(raw.listenedLines) ? Math.max(0, Math.floor(raw.listenedLines!)) : base.listenedLines,
    deaths: Number.isFinite(raw.deaths) ? Math.max(0, Math.floor(raw.deaths!)) : base.deaths,
    checkpoint,
    hauntStage: Number.isFinite(raw.hauntStage) ? Math.max(0, Math.floor(raw.hauntStage!)) : base.hauntStage,
  };
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      for (const legacyKey of LEGACY_KEYS) localStorage.removeItem(legacyKey);
      return defaultSave();
    }
    return normalize(JSON.parse(raw) as Partial<SaveData>);
  } catch {
    return defaultSave();
  }
}

export function writeSave(data: SaveData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(normalize(data)));
  } catch {
    /* private mode */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
    for (const legacyKey of LEGACY_KEYS) localStorage.removeItem(legacyKey);
    localStorage.removeItem("waiting.exe.story.v2");
  } catch {
    /* ignore */
  }
}

export function hasSave(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    const parsed = normalize(JSON.parse(raw) as Partial<SaveData>);
    return parsed.seenIntro || parsed.level > 1 || parsed.notes.length > 0 || parsed.deaths > 0;
  } catch {
    return false;
  }
}

export function pickEnding(_s: SaveData): EndingId {
  return endingFromStory();
}
