import * as Phaser from "phaser";
import { PlayScene } from "./scenes/play-scene";
import { PreloadScene } from "./scenes/preload-scene";
import "./horror-director";

function showRuntimeError(parent: HTMLElement, error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  console.error("[Fluttershy.EXE] Runtime error:", error);
  parent.querySelectorAll("[data-phaser-error]").forEach((node) => node.remove());
  const panel = document.createElement("div");
  panel.dataset.phaserError = "true";
  panel.style.cssText = "position:absolute;inset:0;z-index:99999;background:#08080a;color:#ff8a8a;padding:32px;font:14px/1.5 monospace;white-space:pre-wrap;overflow:auto;pointer-events:auto";
  panel.textContent = `FLUTTERSHY.EXE\n\nGAME STARTUP FAILED\n\n${message}\n\nOpen DevTools (F12) → Console for the full error.`;
  parent.appendChild(panel);
}

function installUiPolish(parent: HTMLElement) {
  const style = document.createElement("style");
  style.dataset.fluttershyPolish = "true";
  style.textContent = `
    .fluttershy-game-shell { position:relative; width:100%; height:100%; background:#050708; overflow:hidden; }
    .fluttershy-game-shell canvas { image-rendering:auto; display:block; filter:saturate(.92) contrast(1.03); }
    .fluttershy-game-shell [data-phaser-error] { text-shadow:0 0 12px rgba(255,70,90,.25); }
    @media (max-width:900px) { .fluttershy-game-shell canvas { max-width:100%; max-height:100%; } }

    /* FLUTTERSHY.EXE visual system: clean retro OS first, horror second. */
    .os-desktop {
      --fx-glass: rgba(12,16,18,.78);
      --fx-glass-strong: rgba(9,12,14,.94);
      --fx-line: rgba(220,235,228,.14);
      --fx-green: #9fd7b3;
      --fx-green-dim: #648d75;
      --fx-red: #d95b64;
      isolation:isolate;
      background-color:#111714;
      background-size:cover;
      background-position:center;
      font-family:"IBM Plex Sans",system-ui,sans-serif;
    }
    .os-desktop::before {
      content:""; position:absolute; inset:0; z-index:0; pointer-events:none;
      background:linear-gradient(180deg,rgba(3,7,6,.04),rgba(3,7,6,.32)),radial-gradient(circle at 50% 30%,rgba(130,190,150,.07),transparent 45%);
    }
    .os-desktop::after {
      content:""; position:absolute; inset:0; z-index:50; pointer-events:none;
      background:repeating-linear-gradient(0deg,rgba(0,0,0,.035) 0 1px,transparent 1px 4px);
      mix-blend-mode:multiply; opacity:.5;
    }
    .os-desktop.is-corrupt::before { background:linear-gradient(180deg,rgba(20,0,3,.12),rgba(0,0,0,.58)),repeating-linear-gradient(90deg,transparent 0 97px,rgba(220,40,60,.025) 97px 98px); }

    /* Desktop icons: restrained, aligned, no oversized cartoon buttons. */
    .os-desktop .scanlines > .relative.z-10 {
      display:grid; grid-template-columns:repeat(1,82px); grid-auto-rows:88px; gap:8px;
      align-content:start; justify-content:start; padding:18px;
    }
    .os-desktop .scanlines > .relative.z-10 > button {
      width:82px; min-height:82px; padding:7px 3px; border:1px solid transparent; border-radius:5px;
      background:transparent; color:#f0f2ed; text-shadow:0 1px 3px #000;
      transition:background 120ms ease,border-color 120ms ease,transform 120ms ease;
    }
    .os-desktop .scanlines > .relative.z-10 > button:hover { background:rgba(110,160,135,.16); border-color:rgba(190,225,205,.18); transform:none; }
    .os-desktop .scanlines > .relative.z-10 > button:active { background:rgba(150,205,175,.22); }
    .os-desktop .scanlines > .relative.z-10 > button img { width:42px;height:42px;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(0,0,0,.55)); }
    .os-desktop .scanlines > .relative.z-10 > button span { max-width:78px; font-size:11px; line-height:14px; }

    /* Game/window chrome: one coherent material instead of mixed flat cards. */
    .os-desktop > .scanlines > .absolute.z-30 {
      inset:10px !important; border:1px solid rgba(225,240,232,.18); border-radius:7px; overflow:hidden;
      background:#080b0b; box-shadow:0 28px 80px rgba(0,0,0,.62),0 0 0 1px rgba(0,0,0,.55);
      backdrop-filter:blur(3px);
    }
    .os-titlebar {
      min-height:32px; padding:4px 6px; gap:5px !important;
      background:linear-gradient(180deg,#294c3c,#183026); color:#e8f0ea;
      border-bottom:1px solid rgba(180,220,195,.17); box-shadow:0 1px 0 rgba(255,255,255,.07) inset;
    }
    .os-titlebar > span { font-family:"IBM Plex Mono",monospace; font-size:11px; font-weight:500; letter-spacing:.03em; }
    .os-titlebar button { min-width:27px; min-height:23px; padding:0 8px; border:1px solid rgba(230,245,235,.2); border-radius:3px; background:#d7ddd7; color:#162019; box-shadow:1px 1px 0 rgba(255,255,255,.5) inset; }
    .os-titlebar button:hover { filter:brightness(1.08); }
    .os-titlebar button:last-child { background:#b96a70; color:#fff; }

    /* Main title/menu: hierarchy, negative space, subtle Fluttershy motif. */
    .os-desktop .z-40.flex.flex-col.items-center.justify-center {
      background:radial-gradient(ellipse at 50% 35%,rgba(154,213,177,.11),transparent 28%),linear-gradient(180deg,rgba(3,7,6,.68),rgba(3,6,6,.94));
      backdrop-filter:blur(10px); padding:40px 20px;
    }
    .os-desktop .z-40.flex.flex-col.items-center.justify-center > img {
      width:min(240px,34vw); height:auto; max-height:240px; object-fit:contain;
      filter:drop-shadow(0 18px 32px rgba(0,0,0,.6)) saturate(.92); opacity:.96;
    }
    .os-desktop .z-40.flex.flex-col.items-center.justify-center h1 {
      margin-top:18px; font-family:"Cormorant Garamond",Georgia,serif; font-size:clamp(42px,6vw,72px); line-height:.9;
      letter-spacing:.045em; text-shadow:0 4px 28px rgba(0,0,0,.7); color:#e8eee9;
    }
    .os-desktop .z-40.flex.flex-col.items-center.justify-center p { max-width:620px; color:rgba(215,226,219,.64); letter-spacing:.08em; }
    .os-desktop .z-40.flex.flex-col.items-center.justify-center .mt-5 { width:min(330px,90vw); gap:7px; }
    .os-desktop .z-40.flex.flex-col.items-center.justify-center button.rounded-md.border {
      width:100%; min-height:46px; border:1px solid rgba(190,225,205,.13); border-radius:5px;
      background:linear-gradient(180deg,rgba(30,42,37,.95),rgba(18,27,23,.98)); color:#e5ece7;
      font-family:"IBM Plex Mono",monospace; font-size:12px; letter-spacing:.08em; text-transform:uppercase;
      box-shadow:0 8px 24px rgba(0,0,0,.2),0 1px 0 rgba(255,255,255,.04) inset;
    }
    .os-desktop .z-40.flex.flex-col.items-center.justify-center button.rounded-md.border:hover {
      border-color:rgba(159,215,179,.52); background:linear-gradient(180deg,rgba(39,57,48,.98),rgba(20,31,26,.98)); transform:translateY(-1px);
    }

    /* Dialogue: character portrait is secondary; speaker is a single compact nameplate. */
    .os-desktop .absolute.inset-x-3.bottom-20,
    .os-desktop .absolute.inset-x-10.bottom-8 {
      left:18px; right:18px; bottom:16px; min-height:112px; padding:14px 16px;
      border:1px solid rgba(178,220,193,.18); border-radius:7px;
      background:linear-gradient(135deg,rgba(11,16,15,.97),rgba(18,25,22,.94));
      box-shadow:0 18px 55px rgba(0,0,0,.56),0 1px 0 rgba(255,255,255,.04) inset;
      backdrop-filter:blur(10px);
    }
    .os-desktop .absolute.inset-x-3.bottom-20 img,
    .os-desktop .absolute.inset-x-10.bottom-8 img {
      width:64px;height:64px;border-radius:5px;background:rgba(140,190,155,.06);border:1px solid rgba(180,220,195,.10);
      filter:drop-shadow(0 6px 14px rgba(0,0,0,.45));
    }
    .os-desktop .absolute.inset-x-3.bottom-20 .font-display,
    .os-desktop .absolute.inset-x-10.bottom-8 .font-display { font-size:14px; font-weight:600; letter-spacing:.045em; color:#bfe0c9; }
    .os-desktop .absolute.inset-x-3.bottom-20 .text-sm,
    .os-desktop .absolute.inset-x-10.bottom-8 .text-sm { font-size:14px; line-height:1.62; color:#e5e9e5; max-width:920px; }
    .os-desktop .absolute.inset-x-3.bottom-20 .uppercase,
    .os-desktop .absolute.inset-x-10.bottom-8 .uppercase { display:none; }

    /* HUD: small instrument-like panels. */
    .os-desktop .pointer-events-none.absolute.left-3.top-3 { top:12px;left:12px;gap:5px; }
    .os-desktop .pointer-events-none.absolute.left-3.top-3 span {
      padding:5px 8px; border:1px solid rgba(220,240,228,.13); border-radius:4px;
      background:rgba(7,11,10,.72); color:rgba(230,238,233,.88); box-shadow:0 6px 20px rgba(0,0,0,.24); backdrop-filter:blur(8px);
      font-family:"IBM Plex Mono",monospace; font-size:10px;
    }

    /* Pause and document windows. */
    .os-desktop .z-30.flex.items-center.justify-center.bg-bg\\/70 { background:rgba(2,5,4,.76); backdrop-filter:blur(10px); }
    .os-desktop .z-30.flex.items-center.justify-center.bg-bg\\/70 > div {
      width:min(460px,calc(100vw - 36px)); border:1px solid rgba(180,220,195,.17); border-radius:7px;
      background:linear-gradient(145deg,#151d19,#0c1210); box-shadow:0 30px 90px rgba(0,0,0,.64); padding:24px;
    }
    .os-desktop .z-30.flex.items-center.justify-center.bg-bg\\/70 .rounded-md.border { border-radius:4px; min-height:42px; background:rgba(255,255,255,.035); border-color:rgba(220,240,228,.11); }
    .os-desktop .z-30.flex.items-center.justify-center.bg-bg\\/70 .rounded-md.border:hover { background:rgba(159,215,179,.08); border-color:rgba(159,215,179,.42); }

    /* Taskbar: compact, deliberately retro but not Windows-95 parody. */
    .os-desktop > .flex.h-10.items-center {
      position:relative; z-index:60; height:40px; padding:3px 5px; gap:4px;
      background:linear-gradient(180deg,#1d2924,#111814); border-top:1px solid rgba(220,240,228,.16); box-shadow:0 -8px 28px rgba(0,0,0,.34);
    }
    .os-desktop > .flex.h-10.items-center > span:first-child {
      min-width:82px; height:31px; justify-content:center; align-items:center; border:1px solid rgba(210,235,220,.18); border-radius:3px;
      background:linear-gradient(180deg,#3d654f,#294637); box-shadow:1px 1px 0 rgba(255,255,255,.12) inset; font-family:"IBM Plex Mono",monospace; font-size:10px; letter-spacing:.08em;
    }
    .os-desktop > .flex.h-10.items-center button,
    .os-desktop > .flex.h-10.items-center span:not(:first-child) {
      min-height:30px; padding:0 10px; border:1px solid transparent; border-radius:3px; background:rgba(255,255,255,.035); color:#dbe5df; font-family:"IBM Plex Mono",monospace; font-size:10px;
    }
    .os-desktop > .flex.h-10.items-center button:hover { background:rgba(159,215,179,.09); border-color:rgba(159,215,179,.18); }

    /* Toasts, whispers and corruption. */
    .os-desktop .right-4.top-4 { border:1px solid rgba(159,215,179,.18); border-radius:4px; background:rgba(7,11,10,.84); color:#dbe5df; box-shadow:0 12px 32px rgba(0,0,0,.36); }
    .os-desktop p.absolute.inset-x-0.top-1\\/3 { color:#e48b91; text-shadow:0 0 24px rgba(217,91,100,.52); letter-spacing:.14em; }
    .is-corrupt .os-titlebar { background:linear-gradient(90deg,#40191d,#251011); border-color:rgba(220,90,100,.24); }
    .is-corrupt .scanlines::after { opacity:.88; background:repeating-linear-gradient(to bottom,rgba(0,0,0,.12) 0 1px,transparent 1px 3px); }

    @media (min-width:700px) {
      .os-desktop .scanlines > .relative.z-10 { grid-template-columns:repeat(1,82px); }
    }
    @media (max-width:700px) {
      .os-desktop .scanlines > .relative.z-10 { grid-template-columns:repeat(3,82px); gap:5px; padding:10px; }
      .os-desktop > .scanlines > .absolute.z-30 { inset:4px !important; }
      .os-desktop .absolute.inset-x-3.bottom-20,
      .os-desktop .absolute.inset-x-10.bottom-8 { left:8px;right:8px;bottom:8px;min-height:96px;padding:10px; }
      .os-desktop .absolute.inset-x-3.bottom-20 img,
      .os-desktop .absolute.inset-x-10.bottom-8 img { width:50px;height:50px; }
    }
  `;
  document.head.appendChild(style);
  parent.classList.add("fluttershy-game-shell");

  // Some legacy dialogue entries contain the speaker name in the text even
  // though the dialogue component already renders a nameplate. Remove only
  // that redundant prefix; ordinary prose is left untouched.
  const cleanDialogueNames = () => {
    const prefixes = ["Fluttershy:", "Флаттершай:", "Fluttershy —", "Флаттершай —"];
    const walker = document.createTreeWalker(parent, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) nodes.push(node as Text);
    for (const text of nodes) {
      const value = text.nodeValue ?? "";
      const trimmed = value.trimStart();
      const prefix = prefixes.find((p) => trimmed.startsWith(p));
      if (prefix) text.nodeValue = value.replace(prefix, "").trimStart();
    }
  };
  const observer = new MutationObserver(cleanDialogueNames);
  observer.observe(parent, { childList:true, subtree:true, characterData:true });
  cleanDialogueNames();
  return () => { observer.disconnect(); style.remove(); parent.classList.remove("fluttershy-game-shell"); };
}

function groundSprites(scene: Phaser.Scene) {
  for (const child of scene.children.list) {
    const sprite = child as Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
    const textureKey = (sprite as any).texture?.key;
    if (textureKey === "grass") {
      sprite.y += 6;
      sprite.setDepth(Math.max(sprite.depth, 8));
      sprite.setScale(Math.min(sprite.scaleX || 1, 0.72), Math.min(sprite.scaleY || 1, 0.72));
    }
    if (textureKey === "bush") {
      sprite.y += 3;
      sprite.setDepth(Math.max(sprite.depth, 6));
    }
    if (textureKey?.startsWith("tree-")) {
      sprite.y += 2;
      sprite.setDepth(Math.max(sprite.depth, 3));
    }
  }
}

export function createWaitingGame(parent: HTMLElement, startLevel = 1): Phaser.Game {
  const level = Number.isFinite(startLevel) ? Math.max(1, Math.min(7, Math.floor(startLevel))) : 1;
  const cleanupUi = installUiPolish(parent);

  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: 1280,
    height: 720,
    backgroundColor: "#0b1210",
    pixelArt: false,
    roundPixels: true,
    physics: {
      default: "arcade",
      arcade: { gravity: { x: 0, y: 0 }, debug: false, fps: 60, fixedStep: true },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    render: {
      antialias: false,
      roundPixels: true,
      batchSize: 2048,
      maxLights: 0,
      clearBeforeRender: true,
    },
    fps: { target: 60, forceSetTimeOut: false, smoothStep: true },
    audio: { disableWebAudio: true },
    scene: [],
  });

  game.registry.set("startLevel", level);

  const onError = (event: ErrorEvent) => {
    if (event.error) showRuntimeError(parent, event.error);
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    showRuntimeError(parent, event.reason);
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  game.events.once("destroy", () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    cleanupUi();
  });
  game.events.on("error", (error: unknown) => showRuntimeError(parent, error));

  game.scene.add("preload", PreloadScene, false);
  game.scene.add("play", PlayScene, false);

  const play = game.scene.getScene("play") as PlayScene;
  play.events.once("create", () => groundSprites(play));

  game.scene.start("preload");
  return game;
}
