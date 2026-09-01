import * as Phaser from "phaser";
import { BootScene } from "./scenes/boot-scene";
import { PlayScene } from "./scenes/play-scene";
import { PreloadScene } from "./scenes/preload-scene";
import { SplashScene } from "./scenes/splash-scene";

export function createWaitingGame(parent: HTMLElement, startLevel = 1): Phaser.Game {
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
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
        fps: 60,
        fixedStep: true,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 1280,
      height: 720,
    },
    // Avoid unnecessary texture smoothing work and prefer the GPU when available.
    render: {
      antialias: false,
      antialiasGL: false,
      roundPixels: true,
      powerPreference: "high-performance",
      batchSize: 4096,
      maxLights: 0,
    },
    audio: { disableWebAudio: true },
    scene: [BootScene, SplashScene, PreloadScene, PlayScene],
  });
  game.registry.set("startLevel", startLevel);
  return game;
}
