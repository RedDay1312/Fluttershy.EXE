import { playSfx } from "./audio";

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
let checkpointBanner: HTMLDivElement | null = null;
let checkpointTimer: number | null = null;

function showCheckpointBanner() {
  if (typeof document === "undefined") return;
  if (checkpointTimer) window.clearTimeout(checkpointTimer);
  checkpointBanner?.remove();

  const el = document.createElement("div");
  checkpointBanner = el;
  el.textContent = "CHECKPOINT SAVED";
  Object.assign(el.style, {
    position: "fixed",
    left: "50%",
    top: "18%",
    transform: "translate(-50%, -8px) scale(.96)",
    zIndex: "9999",
    padding: "10px 18px",
    border: "1px solid rgba(255,235,190,.75)",
    background: "rgba(12,14,18,.9)",
    color: "#fff1cf",
    fontFamily: "IBM Plex Sans, sans-serif",
    fontSize: "13px",
    fontWeight: "700",
    letterSpacing: ".18em",
    textShadow: "0 1px 8px rgba(0,0,0,.8)",
    boxShadow: "0 8px 30px rgba(0,0,0,.35)",
    opacity: "0",
    transition: "opacity 140ms ease, transform 180ms ease",
    pointerEvents: "none",
  });
  document.body.appendChild(el);
  requestAnimationFrame(() => {
    el.style.opacity = "1";
    el.style.transform = "translate(-50%, 0) scale(1)";
  });

  checkpointTimer = window.setTimeout(() => {
    if (!checkpointBanner) return;
    checkpointBanner.style.opacity = "0";
    checkpointBanner.style.transform = "translate(-50%, -4px) scale(.98)";
    window.setTimeout(() => {
      checkpointBanner?.remove();
      checkpointBanner = null;
    }, 180);
  }, 1200);
}

export const bridge = {
  emit(e: BridgeEvent) {
    if (e.type === "checkpoint") {
      playSfx("checkpoint");
      showCheckpointBanner();
    }
    handlers.forEach((h) => h(e));
  },
  on(h: Handler) {
    handlers.add(h);
    return () => {
      handlers.delete(h);
    };
  },
};
