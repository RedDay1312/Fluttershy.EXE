export type OverlayKind =
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

export type BridgeEvent =
  | { type: "dialogue"; key: string; speaker?: "fs" | "system" | "npc"; look?: boolean; nameKey?: string }
  | { type: "overlay"; kind: OverlayKind; textKey?: string; ms?: number }
  | { type: "hud"; notes: number; butterflies: number; level: number }
  | { type: "level-clear"; level: number }
  | { type: "interlude"; after: number }
  | { type: "ending" }
  | { type: "pause-request" }
  | { type: "loaded" }
  | { type: "died" }
  | { type: "note"; id: string }
  | { type: "collect"; kind: "butterfly" | "flower" | "letter" | "gem" | "mark" }
  | { type: "cursor-flee" }
  | { type: "desktop-pony" }
  | { type: "toast"; key: string }
  | { type: "shake-window" }
  | { type: "whisper"; key: string }
  | { type: "checkpoint"; level: number; x: number; y: number }
  | { type: "angel-gone" }
  | { type: "nudge-dialogue" };

type Handler = (e: BridgeEvent) => void;
const handlers = new Set<Handler>();

export const bridge = {
  emit(e: BridgeEvent) {
    handlers.forEach((h) => h(e));
  },
  on(h: Handler) {
    handlers.add(h);
    return () => {
      handlers.delete(h);
    };
  },
};
