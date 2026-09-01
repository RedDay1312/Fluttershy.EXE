import { create } from "zustand";
import { bridge } from "@/game/bridge";
import { t, type Lang } from "@/game/i18n";
import { hauntFor, EMPTY_HAUNT, type HauntState } from "@/game/haunt";
import {
  defaultSave,
  loadSave,
  pickEnding,
  writeSave,
  type EndingId,
  type SaveData,
} from "@/game/save";

export type Phase = "boot" | "desktop" | "playing" | "paused" | "ending";
export type OsWindow =
  | "game"
  | "notes"
  | "docs"
  | "recycle"
  | "browser"
  | "task"
  | "comp"
  | "file"
  | null;

export type DialogueLine = {
  key: string;
  speaker: "fs" | "system" | "npc";
  look?: boolean;
  nameKey?: string;
};

type OverlayState = {
  kind:
    | "none"
    | "bsod"
    | "red"
    | "notepad"
    | "freeze"
    | "look"
    | "glitch"
    | "windows"
    | "black"
    | "stare"
    | "webcam";
  text: string;
  until: number;
};

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

function snapshot(s: GameStore): SaveData {
  return {
    version: 2,
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

export const useGameStore = create<GameStore>((set, get) => ({
  ...defaultSave(),
  phase: "boot",
  osWindow: null,
  openFile: null,
  maximized: false,
  dialogue: null,
  dialogueQueue: [],
  dialogueNudge: 0,
  overlay: { kind: "none", text: "", until: 0 },
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

  hydrate() {
    const s = loadSave();
    const haunt = hauntFor(s.hauntStage);
    set({
      ...s,
      haunt,
      corruptDesktop: s.hauntStage >= 3 || s.saveLabel === "wait",
      desktopPony: s.hauntStage >= 4 || s.saveLabel === "wait",
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
      sessionStarted: skip,
      skipTitle: false,
      interludeActive: false,
      seenIntro: skip ? true : get().seenIntro,
    });
  },
  beginSession() {
    set({ sessionStarted: true, phase: "playing", seenIntro: true });
    get().persist();
  },
  freshRun() {
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
      overlay: { kind: "none", text: "", until: 0 },
      ending: null,
      loading: true,
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
      openFile: null,
      restoreFail: null,
    });
    get().persist();
  },
  setPhase(p) {
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
    set({ loading: v, loadProgress: progress });
  },
  queueDialogue(lines) {
    if (!lines.length) return;
    const cur = get().dialogue;
    if (cur) {
      set({ dialogueQueue: [...get().dialogueQueue, ...lines] });
      return;
    }
    const [first, ...rest] = lines;
    set({ dialogue: first, dialogueQueue: rest });
  },
  advanceDialogue(skipped) {
    const s = get();
    if (skipped) set({ skippedLines: s.skippedLines + 1 });
    else set({ listenedLines: s.listenedLines + 1 });
    const next = s.dialogueQueue[0];
    set({
      dialogue: next ?? null,
      dialogueQueue: s.dialogueQueue.slice(1),
    });
    get().persist();
  },
  nudgeDialogue() {
    set({ dialogueNudge: get().dialogueNudge + 1 });
  },
  showOverlay(kind, textKey, ms = 2200) {
    const text = textKey ? t(get().lang, textKey) : "";
    if (overlayTimer) window.clearTimeout(overlayTimer);
    set({ overlay: { kind, text, until: Date.now() + ms } });
    overlayTimer = window.setTimeout(() => {
      set({ overlay: { kind: "none", text: "", until: 0 } });
    }, ms);
  },
  clearOverlay() {
    if (overlayTimer) window.clearTimeout(overlayTimer);
    set({ overlay: { kind: "none", text: "", until: 0 } });
  },
  collectNote(id) {
    const notes = get().notes.includes(id) ? get().notes : [...get().notes, id];
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
    set({ deaths: get().deaths + 1 });
    get().persist();
  },
  setLevel(n) {
    const label =
      n >= 6 ? "wait" : n >= 4 ? "blood" : n >= 2 ? "fog" : get().saveLabel === "wait" ? "wait" : "ok";
    set({
      level: n,
      saveLabel: label,
      corruptDesktop: n >= 5 || get().hauntStage >= 3,
    });
    get().persist();
  },
  setCheckpoint(level, x, y) {
    set({ checkpoint: { level, x, y } });
    get().persist();
  },
  attemptClose() {
    const n = get().closeAttempts + 1;
    set({ closeAttempts: n });
    get().persist();
    if (n >= 4 && get().level >= 6) return "allowed";
    return "blocked";
  },
  finish() {
    const ending = pickEnding(get());
    set({
      ending,
      phase: "ending",
      saveLabel: ending === "escape" || ending === "kind" ? "empty" : "wait",
      desktopPony: ending === "merge" || ending === "loop",
      corruptDesktop: ending !== "kind",
    });
    get().persist();
  },
  resetRun() {
    const lang = get().lang;
    const music = get().music;
    const sfx = get().sfx;
    const keepWait = get().ending === "loop" || get().ending === "merge";
    const next = {
      ...defaultSave(),
      lang,
      music,
      sfx,
      saveLabel: keepWait ? ("wait" as const) : ("ok" as const),
      hauntStage: keepWait ? 6 : 0,
    };
    set({
      ...next,
      phase: "desktop",
      osWindow: null,
      dialogue: null,
      dialogueQueue: [],
      overlay: { kind: "none", text: "", until: 0 },
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
    if (toastTimer) window.clearTimeout(toastTimer);
    set({ toast: key });
    toastTimer = window.setTimeout(() => set({ toast: null }), 2400);
  },
  setShake(v) {
    set({ windowShake: v });
    if (v) window.setTimeout(() => set({ windowShake: false }), 700);
  },
  setWhisper(key) {
    if (whisperTimer) window.clearTimeout(whisperTimer);
    set({ whisper: key });
    if (key) whisperTimer = window.setTimeout(() => set({ whisper: null }), 2800);
  },
  beginInterlude(after) {
    const haunt = hauntFor(after);
    const label = after >= 4 ? "wait" : after >= 3 ? "blood" : after >= 2 ? "fog" : "ok";
    set({
      phase: "desktop",
      osWindow: after >= 1 ? "notes" : null,
      interludeActive: true,
      skipTitle: true,
      hauntStage: after,
      haunt,
      saveLabel: label,
      desktopPony: after >= 4,
      corruptDesktop: after >= 3,
      cursorFlee: after >= 5,
      sessionStarted: false,
      dialogue: null,
      dialogueQueue: [],
      overlay: { kind: "none", text: "", until: 0 },
    });
    get().persist();
    get().showToast("toast.file");
  },
  setAngelGone() {
    set({ angelGone: true });
    get().persist();
  },
  tryRestore(name) {
    set({ restoreFail: name });
    window.setTimeout(() => set({ restoreFail: null }), 2200);
  },
}));

export function bindBridge() {
  return bridge.on((e) => {
    const s = useGameStore.getState();
    switch (e.type) {
      case "dialogue":
        s.queueDialogue([
          { key: e.key, speaker: e.speaker ?? "fs", look: e.look, nameKey: e.nameKey },
        ]);
        break;
      case "overlay":
        s.showOverlay(e.kind, e.textKey, e.ms);
        break;
      case "note": {
        const first = s.notes.length === 0;
        s.collectNote(e.id);
        s.showToast(e.id === "10" ? "toast.letter" : e.id === "16" ? "toast.gem" : "toast.note");
        if (first) s.queueDialogue([{ key: "d.note", speaker: "fs" }]);
        else if (e.id === "10") s.queueDialogue([{ key: "d.letter", speaker: "fs" }]);
        else if (e.id === "16") s.queueDialogue([{ key: "d.gem", speaker: "fs" }]);
        break;
      }
      case "collect":
        if (e.kind === "butterfly") s.addButterfly();
        if (e.kind === "mark") s.addMark();
        if (e.kind === "letter") {
          s.collectNote("10");
          s.showToast("toast.letter");
          s.queueDialogue([{ key: "d.letter", speaker: "fs" }]);
        }
        if (e.kind === "gem") {
          s.collectNote("16");
          s.showToast("toast.gem");
          s.queueDialogue([{ key: "d.gem", speaker: "fs" }]);
        }
        break;
      case "died":
        s.addDeath();
        break;
      case "level-clear":
        s.setLevel(e.level + 1);
        s.setCheckpoint(e.level + 1, 0, 0);
        break;
      case "interlude":
        s.beginInterlude(e.after);
        break;
      case "ending":
        s.finish();
        break;
      case "loaded":
        s.setLoading(false, 1);
        break;
      case "pause-request":
        if (s.phase === "playing") s.setPhase("paused");
        break;
      case "cursor-flee":
        s.setCursorFlee(true);
        window.setTimeout(() => s.setCursorFlee(false), 1800);
        break;
      case "desktop-pony":
        s.setDesktopPony(true);
        break;
      case "toast":
        s.showToast(e.key);
        break;
      case "shake-window":
        s.setShake(true);
        break;
      case "whisper":
        s.setWhisper(e.key);
        break;
      case "checkpoint":
        s.setCheckpoint(e.level, e.x, e.y);
        break;
      case "angel-gone":
        s.setAngelGone();
        break;
      case "nudge-dialogue":
        s.nudgeDialogue();
        break;
      default:
        break;
    }
  });
}
