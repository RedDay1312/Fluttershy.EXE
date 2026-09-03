import Phaser from 'phaser';
import { CHAPTERS } from './LevelData.js';
import { GameState, addShard, completeChapter, loseChapterProgress } from './GameState.js';
import { saveGame } from './Storage.js';
import { Player, ChapterBuilder } from './Player.js';

export class GameScene extends Phaser.Scene {
  constructor() { super('GameScene'); }

  create() {
    this.data = CHAPTERS[GameState.chapterIndex];
    this.dead = false;
    this.pausedByUser = false;
    this.threatStarted = false;

    this.cameras.main.fadeIn(500, 0, 0, 0);
    this.pickups = this.physics.add.group({ allowGravity: false, immovable: true });
    const world = ChapterBuilder.build(this, this.data);

    this.player = new Player(this, this.data.spawn.x, this.data.spawn.y);
    this.physics.add.collider(this.player, world.platforms);
    this.physics.add.collider(this.player, world.floor);
    this.physics.add.collider(this.player, world.door);
    this.physics.add.overlap(this.player, this.pickups, this.collectShard, null, this);

    const hazards = this.physics.world.staticBodies.entries
      .map((body) => body.gameObject)
      .filter((object) => object?.getData?.('hazard'));
    for (const hazard of hazards) this.physics.add.overlap(this.player, hazard, this.handleDeath, null, this);

    this.exit = world.door;
    this.threat = this.physics.add.image(-500, -500, 'threat');
    this.threat.setScale(0.52).setDepth(19).setVisible(false);
    this.threat.body.allowGravity = false;
    this.physics.add.overlap(this.player, this.threat, this.handleDeath, null, this);

    this.inputKeys = this.input.keyboard.addKeys({
      a: 'A', d: 'D', left: 'LEFT', right: 'RIGHT', w: 'W', up: 'UP', space: 'SPACE', interact: 'E', enter: 'ENTER',
    });
    this.input.keyboard.on('keydown-P', this.togglePause, this);
    this.input.keyboard.on('keydown-ESC', this.togglePause, this);

    this.ui = this.add.container(28, 24).setScrollFactor(0).setDepth(100);
    this.ui.add(this.add.text(0, 0, this.data.title, { fontFamily: 'monospace', fontSize: '20px', color: '#f4f0e7', fontStyle: 'bold' }));
    this.ui.add(this.add.text(0, 32, 'СТРАХ', { fontFamily: 'monospace', fontSize: '12px', color: '#aaa49a' }));
    this.fearBack = this.add.rectangle(0, 52, 240, 10, 0x111215, 0.9).setOrigin(0);
    this.fearFill = this.add.rectangle(0, 52, 1, 10, 0xded7cc, 1).setOrigin(0);
    this.shardText = this.add.text(0, 74, '', { fontFamily: 'monospace', fontSize: '12px', color: '#c5c0b7' });
    this.ui.add([this.fearBack, this.fearFill, this.shardText]);
    this.message = this.add.text(640, 645, '', {
      fontFamily: 'monospace', fontSize: '17px', color: '#f2eee8', align: 'center', stroke: '#000000', strokeThickness: 5,
      wordWrap: { width: 900 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);
    this.pausePanel = this.add.rectangle(640, 360, 560, 250, 0x050607, 0.96).setScrollFactor(0).setDepth(110).setVisible(false);
    this.pauseText = this.add.text(640, 360, 'ПАУЗА\n\nP / ESC — продолжить', { fontFamily: 'monospace', fontSize: '20px', color: '#ebe6dd', align: 'center', lineSpacing: 10 }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);

    this.createStoryMessage(this.data.message);
    this.cameras.main.startFollow(this.player, true, 0.09, 0.09);
    this.cameras.main.setDeadzone(520, 280);
    this.updateHud();
  }

  collectShard(player, shard) {
    if (!shard.active) return;
    shard.disableBody(true, true);
    addShard();
    this.createStoryMessage('Фрагмент памяти найден. Стало немного тише.');
    this.cameras.main.shake(120, 0.0015);
    this.updateHud();
  }

  createStoryMessage(text) {
    this.message.setText(text);
    this.tweens.killTweensOf(this.message);
    this.message.setAlpha(0);
    this.tweens.add({ targets: this.message, alpha: 1, duration: 450, hold: 2200, yoyo: true, ease: 'Sine.inOut' });
  }

  handleDeath() {
    if (this.dead || this.pausedByUser) return;
    this.dead = true;
    GameState.deaths += 1;
    loseChapterProgress();
    saveGame(GameState);
    this.player.setTexture('player-hurt');
    this.cameras.main.shake(220, 0.014);
    this.cameras.main.fadeOut(400, 0, 0, 0);
    this.time.delayedCall(440, () => this.scene.restart());
  }

  startThreat() {
    if (this.threatStarted || this.dead) return;
    this.threatStarted = true;
    this.threat.setPosition(this.player.x + 700, 470).setVisible(true).setAlpha(0);
    this.tweens.add({ targets: this.threat, alpha: 1, duration: 800 });
    this.createStoryMessage('НЕ ОБОРАЧИВАЙСЯ.');
    this.cameras.main.shake(280, 0.0035);
  }

  updateFear(delta) {
    const moving = Math.abs(this.player.body.velocity.x) > 15;
    GameState.fear = Phaser.Math.Clamp(GameState.fear + (moving ? 0.012 : 0.006) * delta, 0, 100);
    if (GameState.fear > 60) this.startThreat();
    if (GameState.fear > 84 && Math.random() < 0.012) this.cameras.main.shake(55, 0.0014);
  }

  updateThreat() {
    if (!this.threatStarted || this.dead) return;
    const dx = this.player.x - this.threat.x;
    const dy = this.player.y - this.threat.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const speed = 125 + Math.min(95, GameState.fear * 0.9);
    this.threat.setVelocity(dx / distance * speed, dy / distance * speed);
    this.threat.setFlipX(dx < 0);
    this.threat.setAngle(Math.sin(this.time.now * 0.006) * 3);
  }

  tryExit() {
    if (!this.exit || this.dead) return;
    const near = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.exit.x, this.exit.y) < 125;
    if (!near || (!this.inputKeys.interact.isDown && !this.inputKeys.enter.isDown)) return;
    if (GameState.chapterShards < this.data.required) {
      if (!this.exitHintAt || this.time.now > this.exitHintAt) {
        this.exitHintAt = this.time.now + 900;
        this.createStoryMessage(`Дверь закрыта. Нужно ещё ${this.data.required - GameState.chapterShards} фрагм.`);
      }
      return;
    }
    completeChapter();
    saveGame(GameState);
    if (GameState.chapterIndex >= CHAPTERS.length - 1) {
      this.scene.start('FinaleScene');
      return;
    }
    GameState.chapterIndex += 1;
    GameState.chapterShards = 0;
    GameState.fear = 10;
    this.cameras.main.fadeOut(450, 0, 0, 0);
    this.time.delayedCall(470, () => this.scene.restart());
  }

  updateHud() {
    this.shardText.setText(`ПАМЯТЬ ${GameState.chapterShards}/${this.data.shards.length}   ВСЕГО ${GameState.totalShards}`);
    this.fearFill.width = Math.max(2, 240 * GameState.fear / 100);
    this.fearFill.setFillStyle(GameState.fear > 80 ? 0xb85c5c : 0xded7cc, 1);
  }

  togglePause() {
    if (this.dead) return;
    this.pausedByUser = !this.pausedByUser;
    this.pausePanel.setVisible(this.pausedByUser);
    this.pauseText.setVisible(this.pausedByUser);
    this.physics.world.isPaused = this.pausedByUser;
  }

  update(_time, delta) {
    if (this.pausedByUser || this.dead) return;
    this.player.update(this.inputKeys, delta);
    this.updateFear(delta);
    this.updateThreat();
    this.tryExit();
    this.updateHud();
    if (this.player.y > 800) this.handleDeath();
  }
}
