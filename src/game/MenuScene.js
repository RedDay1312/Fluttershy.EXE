import Phaser from 'phaser';
import { CHAPTERS, ENDINGS } from './LevelData.js';
import { GameState, resetRun, startChapter } from './GameState.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const save = this.loadSave();
    this.add.image(0, 0, 'menu-bg').setOrigin(0).setDisplaySize(1280, 720);
    this.add.rectangle(0, 0, 1280, 720, 0x030406, 0.48).setOrigin(0);

    this.add.text(72, 76, 'FLUTTERSHY.EXE', {
      fontFamily: 'monospace', fontSize: '58px', color: '#eee9e0', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 8,
    });
    this.add.text(77, 145, 'A NEW CLEAN BUILD', {
      fontFamily: 'monospace', fontSize: '16px', color: '#918c83', letterSpacing: 3,
    });

    const start = this.makeButton(92, 250, 'НОВАЯ ИГРА', () => {
      resetRun();
      startChapter(0);
      this.scene.start('GameScene');
    });

    const resume = this.makeButton(92, 320, save ? 'ПРОДОЛЖИТЬ' : 'ПРОДОЛЖИТЬ  —  НЕТ СОХРАНЕНИЯ', () => {
      if (!save) return;
      GameState.chapterIndex = Math.min(CHAPTERS.length - 1, save.chapterIndex ?? 0);
      GameState.totalShards = save.totalShards ?? 0;
      GameState.deaths = save.deaths ?? 0;
      GameState.bestEnding = save.bestEnding ?? null;
      GameState.completedChapters = save.completedChapters ?? 0;
      startChapter(GameState.chapterIndex);
      this.scene.start('GameScene');
    });
    if (!save) resume.setAlpha(0.35);

    this.makeButton(92, 390, 'УПРАВЛЕНИЕ', () => this.showControls());
    this.makeButton(92, 460, 'СБРОСИТЬ СОХРАНЕНИЕ', () => {
      localStorage.removeItem('fluttershy-exe-clean-v1');
      this.scene.restart();
    });

    this.add.text(92, 612, 'WASD / стрелки — ходить    SPACE — прыгать    E — открыть дверь\nP / ESC — пауза', {
      fontFamily: 'monospace', fontSize: '13px', color: '#77746f', lineSpacing: 7,
    });
    this.add.text(1080, 650, 'BUILD 1.0', { fontFamily: 'monospace', fontSize: '12px', color: '#55534f' });

    this.input.keyboard.once('keydown-ENTER', () => start.emit('pointerdown'));
  }

  loadSave() {
    try {
      const raw = localStorage.getItem('fluttershy-exe-clean-v1');
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data?.version === 1 ? data : null;
    } catch {
      return null;
    }
  }

  makeButton(x, y, label, handler) {
    const text = this.add.text(x, y, `[ ${label} ]`, {
      fontFamily: 'monospace', fontSize: '20px', color: '#d8d3ca',
    }).setInteractive({ useHandCursor: true });
    text.on('pointerover', () => text.setColor('#ffffff'));
    text.on('pointerout', () => text.setColor('#d8d3ca'));
    text.on('pointerdown', handler);
    return text;
  }

  showControls() {
    const panel = this.add.rectangle(640, 360, 700, 380, 0x030405, 0.97).setDepth(20);
    const copy = this.add.text(640, 360,
      'УПРАВЛЕНИЕ\n\nA / D или ← / →   движение\nSPACE / W / ↑      прыжок\nE / ENTER            открыть дверь\nP / ESC              пауза\n\nСобирай фрагменты памяти. Они снижают страх.\nКогда страх становится слишком высоким, она приходит.\n\nНажми любую клавишу, чтобы закрыть.',
      { fontFamily: 'monospace', fontSize: '16px', color: '#e2ddd4', align: 'center', lineSpacing: 9 }
    ).setOrigin(0.5).setDepth(21);
    const close = () => { panel.destroy(); copy.destroy(); this.input.keyboard.off('keydown', close); };
    this.input.keyboard.once('keydown', close);
    panel.setInteractive();
    panel.once('pointerdown', close);
  }
}
