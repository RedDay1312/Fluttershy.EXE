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
