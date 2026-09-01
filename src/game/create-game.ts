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

export function createWaitingGame(parent: HTMLElement, startLevel = 1): Phaser.Game {
  const level = Number.isFinite(startLevel) ? Math.max(1, Math.min(7, Math.floor(startLevel))) : 1;

  // Canvas avoids browser/GPU-specific WebGL context failures. This game is a
  // 2D platformer, so Canvas is sufficient and more deterministic.
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
  });
  game.events.on("error", (error: unknown) => showRuntimeError(parent, error));

  game.scene.add("preload", PreloadScene, false);
  game.scene.add("play", PlayScene, false);
  game.scene.start("preload");

  return game;
}
