import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player-idle');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(0.42);
    this.setDepth(20);
    this.setCollideWorldBounds(true);
    this.body.setSize(150, 250, true);
    this.speed = 260;
    this.jump = 580;
    this.facing = 1;
    this.animClock = 0;
    this.frameIndex = 0;
    this.lookFrames = ['player-look-1', 'player-look-2', 'player-look-3', 'player-look-4'];
  }

  update(input, delta) {
    const left = input.a.isDown || input.left.isDown;
    const right = input.d.isDown || input.right.isDown;
    const jump = input.w.isDown || input.up.isDown || input.space.isDown;
    const direction = (right ? 1 : 0) - (left ? 1 : 0);

    this.setVelocityX(direction * this.speed);
    if (direction !== 0) this.facing = direction;

    if (jump && this.body.blocked.down && delta <= 50 && !this.jumpHeld) {
      this.setVelocityY(-this.jump);
    }
    this.jumpHeld = jump;

    if (direction === 0) {
      this.animClock = 0;
      this.frameIndex = 0;
      this.setTexture('player-idle');
      return;
    }

    this.animClock += delta;
    if (this.animClock >= 90) {
      this.animClock -= 90;
      this.frameIndex = (this.frameIndex + 1) % this.lookFrames.length;
      this.setTexture(this.lookFrames[this.frameIndex]);
    }
    this.setFlipX(this.facing < 0);
  }

  reset(x, y) {
    this.enableBody(true, x, y, true, true);
    this.setTexture('player-idle');
    this.setFlipX(false);
    this.setVelocity(0, 0);
    this.jumpHeld = false;
  }
}

export class ChapterBuilder {
  static build(scene, data) {
    scene.physics.world.setBounds(0, 0, data.width, 720);
    scene.cameras.main.setBounds(0, 0, data.width, 720);

    scene.add.image(0, 0, data.sky)
      .setOrigin(0).setScrollFactor(0).setDisplaySize(1280, 720).setAlpha(0.92).setDepth(0);
    scene.add.tileSprite(0, 285, data.width + 1400, 435, data.far)
      .setOrigin(0).setScrollFactor(0.15).setAlpha(0.94).setDepth(1);
    scene.add.rectangle(0, 0, data.width + 1000, 720, 0x050508, 0.18)
      .setOrigin(0).setScrollFactor(0.02).setDepth(2);

    const worldFloor = scene.physics.add.staticImage(data.width / 2, 710, `plat-${data.platform}`);
    worldFloor.setDisplaySize(data.width + 240, 90).refreshBody().setDepth(8);

    const platforms = scene.physics.add.staticGroup();
    for (const [x, y, width] of data.platforms) {
      const tile = platforms.create(x, y, `plat-${data.platform}`);
      tile.setDisplaySize(width, 48).refreshBody().setDepth(10);
    }

    for (const x of data.hazards) {
      const hazard = scene.physics.add.staticImage(x, 650, 'spikes');
      hazard.setScale(0.8).setDepth(11).setData('hazard', true).refreshBody();
    }

    for (const x of data.shards) {
      const shard = scene.physics.add.image(x, Phaser.Math.Between(340, 555), 'gem');
      shard.setScale(0.44).setDepth(15).setData('collectible', true);
      shard.body.allowGravity = false;
      shard.body.immovable = true;
      scene.pickups.add(shard);
      scene.tweens.add({
        targets: shard,
        y: shard.y - 18,
        angle: 180,
        duration: 950,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
      });
    }

    const door = scene.physics.add.staticImage(data.width - 150, 592, 'door');
    door.setScale(0.75).setDepth(13).refreshBody();

    if (data.fog) {
      scene.add.tileSprite(0, 0, data.width + 1400, 720, 'fog-overlay')
        .setOrigin(0).setScrollFactor(0.08).setAlpha(0.13).setDepth(5);
    }

    return { platforms, floor: worldFloor, door };
  }
}
