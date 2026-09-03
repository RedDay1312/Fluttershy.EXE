import Phaser from 'phaser';
import { BootScene } from './game/BootScene.js';
import { MenuScene } from './game/MenuScene.js';
import { GameScene } from './game/GameScene.js';
import { FinaleScene } from './game/FinaleScene.js';
import { AudioEngine } from './game/AudioEngine.js';
import '../styles.css';

const config = {
  type: Phaser.AUTO,
  parent: 'game-root',
  width: 1280,
  height: 720,
  backgroundColor: '#05050a',
  render: { antialias: true, pixelArt: false, roundPixels: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, width: 1280, height: 720 },
  physics: { default: 'arcade', arcade: { gravity: { y: 1500 }, debug: false } },
  input: { activePointers: 2, gamepad: true },
  scene: [BootScene, MenuScene, GameScene, FinaleScene]
};

const game = new Phaser.Game(config);
game.events.on('ready', () => AudioEngine.bind(game));
window.addEventListener('error', (event) => console.error('[FLUTTERSHY.EXE]', event.error || event.message));
window.addEventListener('unhandledrejection', (event) => console.error('[FLUTTERSHY.EXE]', event.reason));
