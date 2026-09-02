import { create } from "zustand";
import { bridge } from "@/game/bridge";
import { t, type Lang } from "@/game/i18n";
import { hauntFor, EMPTY_HAUNT, type HauntState } from "@/game/haunt";
import { defaultSave, loadSave, pickEnding, writeSave, type EndingId, type SaveData, SAVE_VERSION } from "@/game/save";

export type Phase = "boot" | "desktop" | "playing" | "paused" | "ending";
export type OsWindow = "game" | "notes" | "docs" | "recycle" | "browser" | "task" | "comp" | "file" | null;
export type DialogueLine = { key: string; speaker: "fs" | "system" | "npc"; look?: boolean; nameKey?: string };
type OverlayState = { kind: "none" | "bsod" | "red" | "notepad" | "freeze" | "look" | "glitch" | "windows" | "black" | "stare" | "webcam"; text: string; until: number };
type GameStore = SaveData & {
  phase: Phase;
  osWindow: OsWindow;
  openFile: { title: string; body: string } | null;
  maximized: boolean;
  dialogue: DialogueLine | null;
  dialogueQueue: DialogueLine[];
  dialogueNudge: number;
  overlay: OverlayState;
  ending: EndingId | null;
  loading: boolean;
  loadProgress: number;
  desktopPony: boolean;
  cursorFlee: boolean;
  corruptDesktop: boolean;
  bootDone: boolean;
  sessionStarted: boolean;
  skipTitle: boolean;
  interludeActive: boolean;
  runId: number;
  toast: string | null;
  windowShake: boolean;
  whisper: string | null;
  haunt: HauntState;
  restoreFail: string | null;
  deathStreak: number;
  deathReactionKey: string | null;
  deathReactionId: number;
  hydrate: () => void;
  persist: () => void;
  setLang: (lang: Lang) => void;
  setAudio: (music: boolean, sfx: boolean) => void;
  openWindow: (w: OsWindow) => void;
  openDeskFile: (title: string, body: string) => void;
  launchGame: () => void;
  beginSession: () => void;
  freshRun: () => void;
  setPhase: (p: Phase) => void;
  setMaximized: (v: boolean) => void;
  setLoading: (v: boolean, progress?: number) => void;
  queueDialogue: (lines: DialogueLine[]) => void;
  advanceDialogue: (skipped: boolean) => void;
  nudgeDialogue: () => void;
  showOverlay: (kind: OverlayState["kind"], textKey?: string, ms?: number) => void;
  clearOverlay: () => void;
  collectNote: (id: string) => void;
  addButterfly: () => void;
  addMark: () => void;
  addDeath: () => void;
  setLevel: (n: number) => void;
  setCheckpoint: (level: number, x: number, y: number) => void;
  clearCheckpoint: () => void;
  attemptClose: () => "blocked" | "allowed";
  finish: () => void;
  resetRun: () => void;
  setDesktopPony: (v: boolean) => void;
  setCursorFlee: (v: boolean) => void;
  showToast: (key: string) => void;
  setShake: (v: boolean) => void;
  setWhisper: (key: string | null) => void;
  beginInterlude: (after: number) => void;
  setAngelGone: () => void;
  tryRestore: (name: string) => void;
};

let overlayTimer: number | null = null;
let toastTimer: number | null = null;
let whisperTimer: number | null = null;
let shakeTimer: number | null = null;
let restoreTimer: number | null = null;

function clearTimers() {
  if (overlayTimer !== null) window.clearTimeout(overlayTimer);
  if (toastTimer !== null) window.clearTimeout(toastTimer);
  if (whisperTimer !== null) window.clearTimeout(whisperTimer);
  if (shakeTimer !== null) window.clearTimeout(shakeTimer);
  if (restoreTimer !== null) window.clearTimeout(restoreTimer);
  overlayTimer = toastTimer = whisperTimer = shakeTimer = restoreTimer = null;
}

function snapshot(s: GameStore): SaveData {
  return {
    version: SAVE_VERSION,
    lang: s.lang,
    level: s.level,
    notes: s.notes,
    butterflies: s.butterflies,
    marks: s.marks,
    closeAttempts: s.closeAttempts,
    skippedLines: s.skippedLines,
    listenedLines: s.listenedLines,
    deaths: s.deaths,
    music: s.music,
    sfx: s.sfx,
    saveLabel: s.saveLabel,
    seenIntro: s.seenIntro,
    checkpoint: s.checkpoint,
    hauntStage: s.hauntStage,
    angelGone: s.angelGone,
  };
}

const EMPTY_OVERLAY: OverlayState = { kind: "none", text: "", until: 0 };

export const useGameStore = create<GameStore>((set, get) => ({
  ...defaultSave(),
  phase: "boot",
  osWindow: null,
  openFile: null,
  maximized: false,
  dialogue: null,
  dialogueQueue: [],
  dialogueNudge: 0,
  overlay: EMPTY_OVERLAY,
  ending: null,
  loading: false,
  loadProgress: 0,
  desktopPony: false,
  cursorFlee: false,
  corruptDesktop: false,
  bootDone: false,
  sessionStarted: false,
  skipTitle: false,
  interludeActive: false,
  runId: 0,
  toast: null,
  windowShake: false,
  whisper: null,
  haunt: EMPTY_HAUNT,
  restoreFail: null,
  deathStreak: 0,
  deathReactionKey: null,
  deathReactionId: 0,

  hydrate() {
    clearTimers();
    const s = loadSave();
    const haunt = hauntFor(s.hauntStage);
    set({
      ...s,
      haunt,
      corruptDesktop: s.hauntStage >= 3 || s.saveLabel === "wait",
      desktopPony: s.hauntStage >= 4 || s.saveLabel === "wait",
      deathStreak: 0,
      deathReactionKey: null,
      deathReactionId: 0,
    });
  },

  persist() {
    writeSave(snapshot(get()));
  },

  setLang(lang) {
    set({ lang });
    get().persist();
  },

  setAudio(music, sfx) {
    set({ music, sfx });
    get().persist();
  },

  openWindow(w) {
    set({ osWindow: w, openFile: w === "file" ? get().openFile : null, maximized: w === "game" ? get().maximized : false });
  },

  openDeskFile(title, body) {
    set({ osWindow: "file", openFile: { title, body } });
  },

  launchGame() {
    const skip = get().skipTitle || get().interludeActive;
    set({
      osWindow: "game",
      phase: "playing",
      maximized: true,
      loading: true,
      loadProgress: 0,
      sessionStarted: skip,
      skipTitle: false,
      interludeActive: false,
      seenIntro: skip ? true : get().seenIntro,
      runId: get().runId + 1,
    });
  },

  beginSession() {
    set({ sessionStarted: true, phase: "playing", seenIntro: true });
    get().persist();
  },

  freshRun() {
    clearTimers();
    const lang = get().lang;
    const music = get().music;
    const sfx = get().sfx;
    const next = { ...defaultSave(), lang, music, sfx };
    set({
      ...next,
      phase: "playing",
      osWindow: "game",
      dialogue: null,
      dialogueQueue: [],
      overlay: EMPTY_OVERLAY,
      ending: null,
      loading: true,
      loadProgress: 0,
      desktopPony: false,
      cursorFlee: false,
      corruptDesktop: false,
      maximized: true,
      sessionStarted: true,
      skipTitle: false,
      interludeActive: false,
      runId: get().runId + 1,
      toast: null,
      whisper: null,
      haunt: EMPTY_HAUNT,
      restoreFail: null,
      deathStreak: 0,
      deathReactionKey: null,
      deathReactionId: get().deathReactionId + 1,
    });
    get().persist();
  },

  setPhase(p) {
    if (p === "playing" && get().phase === "paused") {
      set({ phase: p });
      return;
    }
    if (p === "paused" && get().phase === "playing" && get().level >= 3 && !get().dialogue) {
      set({ phase: p });
      get().setWhisper("whisper.6");
      return;
    }
    set({ phase: p });
  },

  setMaximized(v) {
    set({ maximized: v });
  },

  setLoading(v, progress = 0) {
    set({ loading: v, loadProgress: Math.max(0, Math.min(1, progress)) });
  },

  queueDialogue(lines) {
    const filtered = lines.filter((line) => line && line.key.trim());
    if (!filtered.length) return;
    const cur = get().dialogue;
    if (cur) {
      set({ dialogueQueue: [...get().dialogueQueue, ...filtered] });
      return;
    }
    const [first, ...rest] = filtered;
    set({ dialogue: first, dialogueQueue: rest });
  },

  advanceDialogue(skipped) {
    const s = get();
    if (!s.dialogue) return;
    set({
      skippedLines: skipped ? s.skippedLines + 1 : s.skippedLines,
      listenedLines: skipped ? s.listenedLines : s.listenedLines + 1,
      dialogue: s.dialogueQueue[0] ?? null,
      dialogueQueue: s.dialogueQueue.slice(1),
    });
    get().persist();
  },

  nudgeDialogue() {
    set({ dialogueNudge: get().dialogueNudge + 1 });
  },

  showOverlay(kind, textKey, ms = 2200) {
    if (overlayTimer !== null) window.clearTimeout(overlayTimer);
    const duration = Math.max(0, ms);
    const text = textKey ? t(get().lang, textKey) : "";
    set({ overlay: { kind, text, until: Date.now() + duration } });
    overlayTimer = window.setTimeout(() => {
      overlayTimer = null;
      set({ overlay: EMPTY_OVERLAY });
    }, duration);
  },

  clearOverlay() {
    if (overlayTimer !== null) window.clearTimeout(overlayTimer);
    overlayTimer = null;
    set({ overlay: EMPTY_OVERLAY });
  },

  collectNote(id) {
    const trimmed = id.trim();
    if (!trimmed) return;
    const notes = get().notes.includes(trimmed) ? get().notes : [...get().notes, trimmed];
    set({ notes });
    get().persist();
  },

  addButterfly() {
    set({ butterflies: get().butterflies + 1 });
    get().persist();
  },

  addMark() {
    set({ marks: get().marks + 1 });
    get().persist();
  },

  addDeath() {
    const streak = Math.min(12, get().deathStreak + 1);
    const deaths = get().deaths + 1;
    const stage = Math.max(get().hauntStage, get().level >= 5 ? 5 : 0);
    const reactionKey =
      streak >= 8 || deaths >= 12
        ? "death.react.8"
        : streak >= 6
          ? "death.react.6"
          : streak >= 4
            ? "death.react.4"
            : streak >= 3
              ? "death.react.3"
              : streak >= 2
                ? "death.react.2"
                : stage >= 4
                  ? "death.react.late"
                  : "death.react.1";
    set({ deaths, deathStreak: streak, deathReactionKey: reactionKey, deathReactionId: get().deathReactionId + 1 });
    if (streak >= 4 || deaths >= 8) get().setWhisper(reactionKey);
    get().persist();
  },

  setLevel(n) {
    const level = Math.min(7, Math.max(1, Math.floor(n)));
    const label = level >= 6 ? "wait" : level >= 4 ? "blood" : level >= 2 ? "fog" : get().saveLabel === "wait" ? "wait" : "ok";
    set({ level, saveLabel: label, corruptDesktop: level >= 5 || get().hauntStage >= 3, checkpoint: null, deathStreak: 0 });
    get().persist();
  },

  setCheckpoint(level, x, y) {
    if (!Number.isFinite(level) || !Number.isFinite(x) || !Number.isFinite(y)) return;
    if (x <= 40 || y <= 0) return;
    set({ checkpoint: { level: Math.min(7, Math.max(1, Math.floor(level))), x, y } });
    get().persist();
  },

  clearCheckpoint() {
    if (!get().checkpoint) return;
    set({ checkpoint: null });
    get().persist();
  },

  attemptClose() {
    const n = get().closeAttempts + 1;
    set({ closeAttempts: n });
    get().persist();
    return n >= 4 && get().level >= 6 ? "allowed" : "blocked";
  },

  finish() {
    const ending = pickEnding(get());
    set({
      ending,
      phase: "ending",
      osWindow: "game",
      loading: false,
      saveLabel: ending === "escape" || ending === "kind" ? "empty" : "wait",
      desktopPony: ending === "merge" || ending === "loop",
      corruptDesktop: ending !== "kind",
      dialogue: null,
      dialogueQueue: [],
      overlay: EMPTY_OVERLAY,
    });
    get().persist();
  },

  resetRun() {
    clearTimers();
    const lang = get().lang;
    const music = get().music;
    const sfx = get().sfx;
    const keepWait = get().ending === "loop" || get().ending === "merge";
    const next = { ...defaultSave(), lang, music, sfx, saveLabel: keepWait ? ("wait" as const) : ("ok" as const), hauntStage: keepWait ? 6 : 0 };
    set({
      ...next,
      phase: "desktop",
      osWindow: null,
      dialogue: null,
      dialogueQueue: [],
      overlay: EMPTY_OVERLAY,
      ending: null,
      loading: false,
      desktopPony: keepWait,
      cursorFlee: false,
      corruptDesktop: keepWait,
      maximized: false,
      sessionStarted: false,
      skipTitle: false,
      interludeActive: false,
      runId: get().runId + 1,
      toast: null,
      whisper: null,
      haunt: hauntFor(next.hauntStage),
      openFile: null,
      restoreFail: null,
      deathStreak: 0,
      deathReactionKey: null,
      deathReactionId: get().deathReactionId + 1,
    });
    get().persist();
  },

  setDesktopPony(v) {
    set({ desktopPony: v });
  },

  setCursorFlee(v) {
    set({ cursorFlee: v });
  },

  showToast(key) {
    if (toastTimer !== null) window.clearTimeout(toastTimer);
    set({ toast: key });
    toastTimer = window.setTimeout(() => {
      toastTimer = null;
      set({ toast: null });
    }, 2600);
  },

  setShake(v) {
    if (shakeTimer !== null) window.clearTimeout(shakeTimer);
    set({ windowShake: v });
    if (v) {
      shakeTimer = window.setTimeout(() => {
        shakeTimer = null;
        set({ windowShake: false });
      }, 420);
    }
  },

  setWhisper(key) {
    if (whisperTimer !== null) window.clearTimeout(whisperTimer);
    if (!key) {
      set({ whisper: null });
      return;
    }
    set({ whisper: key });
    whisperTimer = window.setTimeout(() => {
      whisperTimer = null;
      set({ whisper: null });
    }, 3400);
  },

  beginInterlude(after) {
    const run = get().runId;
    set({ interludeActive: true, sessionStarted: false, phase: "desktop" });
    window.setTimeout(() => {
      if (get().runId !== run) return;
      set({ interludeActive: false, sessionStarted: true, phase: "playing" });
    }, Math.max(0, after));
  },

  setAngelGone() {
    set({ angelGone: true });
    get().persist();
  },

  tryRestore(name) {
    if (restoreTimer !== null) window.clearTimeout(restoreTimer);
    const clean = name.trim().toLowerCase();
    if (!clean || get().level < 2) {
      set({ restoreFail: "restore.denied" });
      return;
    }
    set({ restoreFail: null });
    restoreTimer = window.setTimeout(() => {
      restoreTimer = null;
      const s = get();
      if (clean.includes("angel") && s.angelGone) {
        set({ restoreFail: "restore.angel" });
      } else if (clean.includes("save") || clean.includes("game")) {
        set({ restoreFail: "restore.fake" });
      } else {
        set({ restoreFail: "restore.denied" });
      }
    }, 650);
  },
}));
