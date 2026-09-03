import Phaser from 'phaser';
import { BootScene } from './game/BootScene.js';
import { MenuScene } from './game/MenuScene.js';
import { GameScene } from './game/GameScene.js';
import { FinaleScene } from './game/FinaleScene.js';
import './styles.css';

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game',
  backgroundColor: '#050608',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1450 },
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  render: {
    antialias: true,
    pixelArt: false,
    roundPixels: true,
  },
  scene: [BootScene, MenuScene, GameScene, FinaleScene],
};

window.addEventListener('error', (event) => {
  console.error('[Fluttershy.EXE] runtime error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Fluttershy.EXE] unhandled promise rejection:', event.reason);
});

new Phaser.Game(config);
