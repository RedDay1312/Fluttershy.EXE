import * as Phaser from "phaser";
import { PlayScene } from "./scenes/play-scene";
import { PreloadScene } from "./scenes/preload-scene";
import "./horror-director";

export function createWaitingGame(parent: HTMLElement, startLevel = 1): Phaser.Game {
  // Do not let Phaser auto-start the first scene before the registry contains
  // the requested level. The React desktop owns the actual title screen.
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
    scene: [],
  });

  const level = Number.isFinite(startLevel) ? Math.max(1, Math.min(7, Math.floor(startLevel))) : 1;
  game.registry.set("startLevel", level);
  game.scene.add("preload", PreloadScene, false);
  game.scene.add("play", PlayScene, false);
  game.scene.start("preload");

  return game;
}
