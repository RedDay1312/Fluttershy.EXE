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
let horrorBusy = false;

function showCheckpointBanner() {
  if (typeof document === "undefined") return;
  if (checkpointTimer) window.clearTimeout(checkpointTimer);
  checkpointBanner?.remove();

  const el = document.createElement("div");
  checkpointBanner = el;
  el.textContent = "CHECKPOINT SAVED";
  Object.assign(el.style, {
    position: "fixed", left: "50%", top: "18%",
    transform: "translate(-50%, -8px) scale(.96)", zIndex: "9999",
    padding: "10px 18px", border: "1px solid rgba(255,235,190,.75)",
    background: "rgba(12,14,18,.9)", color: "#fff1cf",
    fontFamily: "IBM Plex Sans, sans-serif", fontSize: "13px", fontWeight: "700",
    letterSpacing: ".18em", textShadow: "0 1px 8px rgba(0,0,0,.8)",
    boxShadow: "0 8px 30px rgba(0,0,0,.35)", opacity: "0",
    transition: "opacity 140ms ease, transform 180ms ease", pointerEvents: "none",
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

function horrorLayer(ms: number) {
  if (typeof document === "undefined") return null;
  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "fixed", inset: "0", zIndex: "10000",
    pointerEvents: "none", overflow: "hidden",
  });
  document.body.appendChild(el);
  window.setTimeout(() => el.remove(), ms);
  return el;
}

function spawnWatcher() {
  if (typeof document === "undefined" || horrorBusy) return;
  horrorBusy = true;
  const layer = horrorLayer(1250);
  if (!layer) return;

  const side = Math.random() > 0.5 ? "left" : "right";
  const x = side === "left" ? "7vw" : "93vw";
  const y = `${18 + Math.random() * 58}vh`;
  const head = document.createElement("div");
  Object.assign(head.style, {
    position: "absolute", left: x, top: y, width: "92px", height: "72px",
    transform: "translate(-50%, -50%) scale(.72)", borderRadius: "48% 48% 42% 42%",
    background: "radial-gradient(ellipse at 50% 45%, rgba(18,18,18,.96) 0 42%, rgba(0,0,0,.72) 68%, transparent 72%)",
    filter: "blur(.4px)", opacity: "0",
    transition: "opacity 90ms linear, transform 240ms ease-out",
  });
  const eyeStyle = {
    position: "absolute", top: "31px", width: "13px", height: "8px",
    borderRadius: "50%", background: "#eee", boxShadow: "0 0 7px rgba(255,255,255,.9)",
  } as const;
  const eyeL = document.createElement("i");
  const eyeR = document.createElement("i");
  Object.assign(eyeL.style, eyeStyle, { left: "27px" });
  Object.assign(eyeR.style, eyeStyle, { right: "27px" });
  head.append(eyeL, eyeR);
  layer.appendChild(head);

  requestAnimationFrame(() => {
    head.style.opacity = "1";
    head.style.transform = "translate(-50%, -50%) scale(1)";
  });
  window.setTimeout(() => {
    head.style.opacity = "0";
    head.style.transform = "translate(-50%, -50%) scale(.94)";
  }, 620);
  window.setTimeout(() => { horrorBusy = false; }, 1300);
}

function glitchBurst() {
  const layer = horrorLayer(520);
  if (!layer) return;
  for (let i = 0; i < 12; i++) {
    const bar = document.createElement("div");
    Object.assign(bar.style, {
      position: "absolute", left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      width: `${4 + Math.random() * 30}%`, height: `${1 + Math.random() * 7}px`,
      background: i % 3 === 0 ? "rgba(255,20,35,.55)" : "rgba(235,235,235,.18)",
      mixBlendMode: "screen", transform: `translateX(${(Math.random() - .5) * 80}px)`,
    });
    layer.appendChild(bar);
  }
  const scan = document.createElement("div");
  Object.assign(scan.style, {
    position: "absolute", inset: "0",
    background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.045) 4px, transparent 5px)",
    mixBlendMode: "screen",
  });
  layer.appendChild(scan);
}

function stareBurst() {
  const layer = horrorLayer(2500);
  if (!layer) return;
  const eyes = document.createElement("div");
  Object.assign(eyes.style, {
    position: "absolute", left: "50%", top: "47%", width: "190px", height: "90px",
    transform: "translate(-50%,-50%) scale(.25)", opacity: "0",
    background: "radial-gradient(ellipse at 30% 50%, #f5f5f5 0 9%, transparent 10%), radial-gradient(ellipse at 70% 50%, #f5f5f5 0 9%, transparent 10%)",
    filter: "drop-shadow(0 0 16px rgba(255,255,255,.35))",
    transition: "opacity 180ms ease, transform 900ms cubic-bezier(.18,.8,.2,1)",
  });
  layer.appendChild(eyes);
  requestAnimationFrame(() => {
    eyes.style.opacity = "1";
    eyes.style.transform = "translate(-50%,-50%) scale(1)";
  });
  window.setTimeout(() => { eyes.style.opacity = "0"; }, 1450);
}

function screamerBurst() {
  if (typeof document === "undefined" || horrorBusy) return;
  horrorBusy = true;
  const layer = horrorLayer(1050);
  if (!layer) return;

  const flash = document.createElement("div");
  Object.assign(flash.style, {
    position: "absolute", inset: "0", background: "#000", opacity: "0",
    transition: "opacity 45ms linear",
  });
  layer.appendChild(flash);

  const face = document.createElement("div");
  Object.assign(face.style, {
    position: "absolute", left: "50%", top: "50%", width: "min(86vw, 860px)", height: "min(86vh, 860px)",
    transform: "translate(-50%,-50%) scale(.28) rotate(-3deg)", opacity: "0",
    backgroundImage: "url('/sprites/fs-horror.png')", backgroundRepeat: "no-repeat",
    backgroundPosition: "center", backgroundSize: "contain",
    filter: "contrast(1.35) saturate(.75) brightness(.72) drop-shadow(0 0 28px rgba(0,0,0,.95))",
    transition: "opacity 55ms linear, transform 130ms cubic-bezier(.08,.9,.2,1)",
  });
  layer.appendChild(face);

  requestAnimationFrame(() => {
    flash.style.opacity = "1";
    face.style.opacity = "1";
    face.style.transform = `translate(-50%,-50%) scale(${1.02 + Math.random() * .2}) rotate(${(Math.random() - .5) * 5}deg)`;
  });

  try { playSfx("whisper"); } catch { /* visual-only fallback */ }

  window.setTimeout(() => {
    face.style.opacity = "0";
    flash.style.opacity = ".82";
  }, 230);
  window.setTimeout(() => {
    horrorBusy = false;
  }, 1100);
}

function deathBurst() {
  const layer = horrorLayer(420);
  if (!layer) return;
  Object.assign(layer.style, {
    background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,.35), rgba(95,0,0,.45) 30%, rgba(0,0,0,.94) 85%)",
    mixBlendMode: "normal",
  });
}

function shakeScreen() {
  if (typeof document === "undefined") return;
  document.body.animate(
    [
      { transform: "translate(0,0)" }, { transform: "translate(-7px,2px)" },
      { transform: "translate(5px,-3px)" }, { transform: "translate(-3px,1px)" },
      { transform: "translate(0,0)" },
    ],
    { duration: 230, easing: "steps(4,end)" },
  );
}

export const bridge = {
  emit(e: BridgeEvent) {
    if (e.type === "checkpoint") {
      playSfx("checkpoint");
      showCheckpointBanner();
    }

    // Rare jump scares are mixed into existing horror events instead of firing constantly.
    if (e.type === "whisper") {
      const roll = Math.random();
      if (roll < 0.16) screamerBurst();
      else if (roll < 0.76) spawnWatcher();
    } else if (e.type === "died") {
      deathBurst();
    } else if (e.type === "shake-window") {
      shakeScreen();
    } else if (e.type === "overlay" && e.kind === "glitch") {
      glitchBurst();
      if (Math.random() < 0.08) window.setTimeout(screamerBurst, 140 + Math.random() * 220);
    } else if (e.type === "overlay" && e.kind === "stare") {
      if (Math.random() < 0.24) screamerBurst();
      else stareBurst();
    } else if (e.type === "overlay" && e.kind === "black") {
      const roll = Math.random();
      if (roll < 0.12) window.setTimeout(screamerBurst, Math.min(700, e.ms ?? 700));
      else if (roll < 0.48) window.setTimeout(spawnWatcher, Math.min(900, e.ms ?? 900));
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
