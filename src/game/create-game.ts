import * as Phaser from "phaser";
import { PlayScene } from "./scenes/play-scene";
import { PreloadScene } from "./scenes/preload-scene";
import "./horror-director";

export function createWaitingGame(parent: HTMLElement, startLevel = 1): Phaser.Game {
  // The desktop UI already provides the title/start screen. Avoid the extra
  // Phaser Boot/Splash chain here: its fade can leave the embedded game black
  // before gameplay is shown.
  const game = new Phaser.Game({
    type: Phaser.AUTO,
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
      antialiasGL: false,
      roundPixels: true,
      powerPreference: "high-performance",
      batchSize: 4096,
      maxLights: 0,
      clearBeforeRender: true,
    },
    fps: { target: 60, forceSetTimeOut: false, smoothStep: true },
    audio: { disableWebAudio: true },
    scene: [PreloadScene, PlayScene],
  });

  game.registry.set("startLevel", Number.isFinite(startLevel) ? Math.max(1, Math.floor(startLevel)) : 1);
  return game;
}
