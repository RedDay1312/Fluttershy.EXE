import * as Phaser from "phaser";
import { PlayScene } from "./scenes/play-scene";
import { PreloadScene } from "./scenes/preload-scene";
import "./horror-director";

export function createWaitingGame(parent: HTMLElement, startLevel = 1): Phaser.Game {
  const level = Number.isFinite(startLevel) ? Math.max(1, Math.min(7, Math.floor(startLevel))) : 1;

  // Canvas avoids browser/GPU-specific WebGL context failures. The game is a
  // 2D platformer, so the Canvas renderer is sufficient and much easier to
  // diagnose on machines where Phaser.AUTO can produce a black canvas.
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

  game.events.on("error", (error: unknown) => {
    console.error("[Fluttershy.EXE] Phaser error:", error);
  });

  game.scene.add("preload", PreloadScene, false);
  game.scene.add("play", PlayScene, false);
  game.scene.start("preload");

  return game;
}
