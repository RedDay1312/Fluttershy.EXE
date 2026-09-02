import { bridge } from "./bridge";
import { clearInput } from "./input";
import { playHorrorSfx, playSfx } from "./audio";

let active = false;
let lastScene = -1;
let sceneTimer: number | null = null;
let kickoffTimer: number | null = null;
let keyHandler: ((e: KeyboardEvent) => void) | null = null;
let timers = new Set<number>();

// Each scene advances the same story instead of being an isolated scare:
// silence -> imitation -> observation -> pursuit -> loss of control -> identity theft.
const SCENES: Record<number, { title: string; text: string; image?: boolean; duration: number }> = {
  1: { title: "Тишина", text: "Понивилль должен быть полон голосов.\nНо сегодня первым тебя встречает пустой дом.\nГде-то внутри кто-то тихо произносит: «Флаттершай…»", image: true, duration: 5000 },
  2: { title: "НЕ ОТВЕЧАЙ", text: "Ты находишь следы Ангела. Они обрываются у стены.\nЗа стеной слышится царапанье.\nПотом голос Флаттершай просит открыть дверь.", image: true, duration: 5200 },
  3: { title: "ОНА СМОТРИТ", text: "Между деревьями стоит силуэт.\nТы узнаёшь позу раньше, чем лицо.\nОн повторяет твой последний шаг — с задержкой в несколько секунд.", image: true, duration: 5200 },
  4: { title: "НЕ ВОЗВРАЩАЙСЯ", text: "Тропа приводит туда, откуда ты уже ушёл.\nНа земле лежат твои собственные следы.\nНо один из них появился раньше тебя.", image: true, duration: 5000 },
  5: { title: "SYSTEM MESSAGE", text: "MEMORY SAMPLE: FLUTTERSHY\nVOICE SAMPLE: ACQUIRED\nFEAR RESPONSE: ACQUIRED\nEXIT PATH: REWRITTEN", duration: 4700 },
  6: { title: "БЕГИ", text: "Теперь оно не прячется.\nОно уже знает, как ты двигаешься.\nЕсли увидишь Флаттершай впереди — не подходи к ней.", image: true, duration: 5400 },
  7: { title: "FLUTTERSHY.EXE", text: "Ты думал, что искал её.\nНо всё это время она училась быть тобой.\nПоследний вопрос уже не «где Флаттершай?», а «кто из вас настоящая?». ", image: true, duration: 6000 },
};

function later(fn: () => void, ms: number) {
  const id = window.setTimeout(() => { timers.delete(id); fn(); }, ms);
  timers.add(id);
  return id;
}

function removeScene(root: HTMLElement) {
  root.style.opacity = "0";
  later(() => root.remove(), 280);
}

function cleanupInput() {
  if (keyHandler) {
    window.removeEventListener("keydown", keyHandler, true);
    keyHandler = null;
  }
  if (sceneTimer !== null) {
    window.clearTimeout(sceneTimer);
    sceneTimer = null;
  }
  if (kickoffTimer !== null) {
    window.clearTimeout(kickoffTimer);
    timers.delete(kickoffTimer);
    kickoffTimer = null;
  }
}

function runCutscene(level: number) {
  if (typeof document === "undefined" || active || level === lastScene) return;
  const scene = SCENES[level];
  if (!scene) return;

  active = true;
  lastScene = level;
  clearInput();
  bridge.emit({ type: "overlay", kind: "freeze", textKey: "freeze.body", ms: scene.duration });

  const root = document.createElement("div");
  Object.assign(root.style, {
    position: "fixed", inset: "0", zIndex: "15000", overflow: "hidden",
    background: "#020304", color: "#ddd", opacity: "0", transition: "opacity 280ms ease",
    pointerEvents: "auto", fontFamily: "IBM Plex Sans, system-ui, sans-serif",
  });
  root.dataset.fluttershyCutscene = String(level);

  const film = document.createElement("div");
  Object.assign(film.style, { position: "absolute", inset: "0", background: "radial-gradient(circle at 50% 48%, rgba(35,42,39,.2), rgba(0,0,0,.96) 76%)" });
  const grain = document.createElement("div");
  Object.assign(grain.style, { position: "absolute", inset: "0", opacity: ".22", mixBlendMode: "screen", background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.035) 4px, transparent 5px)" });

  const topBar = document.createElement("div"), bottomBar = document.createElement("div");
  [topBar, bottomBar].forEach((bar) => Object.assign(bar.style, {
    position: "absolute", left: "0", width: "100%", height: "9vh", background: "#000", zIndex: "4",
    transform: "scaleY(0)", transition: "transform 420ms cubic-bezier(.2,.8,.2,1)",
  }));
  topBar.style.top = "0"; bottomBar.style.bottom = "0";

  const title = document.createElement("div");
  Object.assign(title.style, {
    position: "absolute", left: "8vw", top: "14vh", zIndex: "5", color: "rgba(245,245,245,.88)",
    fontFamily: "Georgia, serif", fontSize: "clamp(20px, 3vw, 38px)", letterSpacing: ".22em",
    textTransform: "uppercase", opacity: "0", transform: "translateX(-24px)", transition: "opacity 600ms ease, transform 700ms ease", textShadow: "0 2px 14px #000",
  });
  title.textContent = scene.title;

  const caption = document.createElement("div");
  Object.assign(caption.style, {
    position: "absolute", left: "8vw", bottom: "16vh", zIndex: "5", maxWidth: "760px", whiteSpace: "pre-line",
    color: "rgba(220,225,222,.76)", fontFamily: "Georgia, serif", fontSize: "clamp(15px, 2vw, 23px)", lineHeight: "1.65",
    opacity: "0", transform: "translateY(18px)", transition: "opacity 700ms ease 500ms, transform 700ms ease 500ms", textShadow: "0 2px 16px #000",
  });
  caption.textContent = scene.text;

  const pony = document.createElement("div");
  Object.assign(pony.style, {
    position: "absolute", left: "50%", top: "52%", width: "min(62vw, 720px)", height: "min(76vh, 720px)",
    transform: "translate(-50%,-50%) scale(.82)", backgroundImage: "url('/sprites/fs-horror.png')", backgroundPosition: "center",
    backgroundRepeat: "no-repeat", backgroundSize: "contain", filter: "contrast(1.45) brightness(.34) saturate(.18) drop-shadow(0 0 40px rgba(0,0,0,.98))",
    opacity: "0", transition: "opacity 420ms ease, transform 1600ms cubic-bezier(.18,.8,.15,1)",
  });

  const progress = document.createElement("div");
  Object.assign(progress.style, { position: "absolute", right: "8vw", bottom: "8vh", zIndex: "5", color: "rgba(255,255,255,.28)", fontSize: "10px", letterSpacing: ".25em", fontFamily: "monospace" });
  progress.textContent = `SCENE 0${level} / 07`;

  root.append(film, grain, topBar, bottomBar, pony, title, caption, progress);
  document.body.appendChild(root);

  requestAnimationFrame(() => {
    if (!active || !root.isConnected) return;
    root.style.opacity = "1";
    topBar.style.transform = "scaleY(1)";
    bottomBar.style.transform = "scaleY(1)";
    title.style.opacity = "1";
    title.style.transform = "translateX(0)";
    caption.style.opacity = "1";
    caption.style.transform = "translateY(0)";
    if (scene.image) {
      pony.style.opacity = "1";
      pony.style.transform = `translate(-50%,-50%) scale(${level >= 6 ? 1.08 : .96})`;
    }
  });

  if (level >= 3) later(() => playHorrorSfx("breath"), 0);
  if (level >= 5) later(() => playHorrorSfx("steps"), 900);
  if (level >= 6) later(() => playSfx("stinger"), 2400);

  if (scene.image && level >= 3) {
    later(() => {
      if (!active || !root.isConnected) return;
      pony.style.filter = "contrast(2) brightness(.18) saturate(0) drop-shadow(0 0 45px rgba(255,255,255,.18))";
      pony.style.transform = "translate(-50%,-50%) scale(1.18) rotate(-2deg)";
      playHorrorSfx("snap");
      later(() => { if (active && root.isConnected) { pony.style.opacity = "0"; film.style.background = "#000"; } }, 95);
    }, Math.max(1500, scene.duration - 1450));
  }

  const finish = () => {
    if (!active) return;
    active = false;
    cleanupInput();
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    clearInput();
    removeScene(root);
  };

  const started = performance.now();
  keyHandler = (e: KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (performance.now() - started > 1800 && (e.code === "Enter" || e.code === "Space")) finish();
  };
  window.addEventListener("keydown", keyHandler, true);
  sceneTimer = window.setTimeout(() => finish(), scene.duration);
}

bridge.on((e) => {
  if (e.type === "level-clear") {
    if (kickoffTimer !== null) window.clearTimeout(kickoffTimer);
    kickoffTimer = later(() => {
      kickoffTimer = null;
      runCutscene(e.level);
    }, 520);
  }
});

export function resetCutscenes() {
  cleanupInput();
  timers.forEach((id) => window.clearTimeout(id));
  timers.clear();
  lastScene = -1;
  active = false;
  if (typeof document !== "undefined") {
    document.querySelectorAll("[data-fluttershy-cutscene]").forEach((node) => node.remove());
  }
}
