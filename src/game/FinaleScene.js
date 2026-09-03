import Phaser from 'phaser';
import { ENDINGS } from './LevelData.js';
import { GameState, resetRun, startChapter } from './GameState.js';
import { clearSave, saveGame } from './Storage.js';

export class FinaleScene extends Phaser.Scene {
  constructor() {
    super('FinaleScene');
  }

  create() {
    const ending = this.getEnding();
    GameState.bestEnding = ending.key;
    saveGame(GameState);

    this.add.image(0, 0, ending.key === 'good' ? 'finale-sky' : 'menu-bg')
      .setOrigin(0).setDisplaySize(1280, 720).setAlpha(0.65);
    this.add.rectangle(0, 0, 1280, 720, 0x020304, 0.64).setOrigin(0);

    this.add.text(640, 130, ending.data.title, {
      fontFamily: 'monospace', fontSize: '50px', color: '#eee8de', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 7,
    }).setOrigin(0.5);

    this.add.text(640, 270, ending.data.text, {
      fontFamily: 'monospace', fontSize: '18px', color: '#d2cdc4',
      align: 'center', lineSpacing: 10, wordWrap: { width: 820 },
    }).setOrigin(0.5);

    this.add.text(640, 440, `ФРАГМЕНТЫ ПАМЯТИ: ${GameState.totalShards}    СМЕРТИ: ${GameState.deaths}`, {
      fontFamily: 'monospace', fontSize: '14px', color: '#88847c',
    }).setOrigin(0.5);

    const menu = this.add.text(640, 550, '[ ENTER — НОВАЯ ИГРА ]', {
      fontFamily: 'monospace', fontSize: '19px', color: '#ded8ce',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    menu.on('pointerover', () => menu.setColor('#ffffff'));
    menu.on('pointerout', () => menu.setColor('#ded8ce'));
    menu.on('pointerdown', () => this.newGame());

    this.input.keyboard.once('keydown-ENTER', () => this.newGame());
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }

  getEnding() {
    if (GameState.totalShards >= 14) return { key: 'good', data: ENDINGS.good };
    if (GameState.totalShards >= 8) return { key: 'broken', data: ENDINGS.broken };
    return { key: 'bad', data: ENDINGS.bad };
  }

  newGame() {
    clearSave();
    resetRun();
    startChapter(0);
    this.scene.start('GameScene');
  }
}
