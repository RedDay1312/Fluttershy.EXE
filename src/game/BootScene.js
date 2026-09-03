import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {
    this.load.setPath('/');
    const bar = this.add.graphics();
    const label = this.add.text(640, 360, 'LOADING CLEAN BUILD…', {
      fontFamily: 'monospace', fontSize: '18px', color: '#d7d1c8',
    }).setOrigin(0.5);
    this.load.on('progress', (value) => {
      bar.clear(); bar.fillStyle(0xd7d1c8, 1); bar.fillRect(440, 395, 400 * value, 5);
    });
    this.load.on('complete', () => { bar.destroy(); label.destroy(); });

    this.load.image('menu-bg', 'maps/desktop-wallpaper.jpg');
    this.load.image('finale-sky', 'maps/finale-sky.jpg');
    this.load.image('garden-sky', 'maps/forest-sky.jpg');
    this.load.image('garden-far', 'maps/forest-far.jpg');
    this.load.image('fog-sky', 'maps/fog-sky.jpg');
    this.load.image('fog-far', 'maps/fog-far.jpg');
    this.load.image('glitch-far', 'maps/glitch-far.jpg');
    this.load.image('void-sky', 'maps/void-sky.jpg');
    this.load.image('blood-sky', 'maps/blood-sky.jpg');
    this.load.image('blood-far', 'maps/blood-far.jpg');
    this.load.image('fog-overlay', 'maps/fog-overlay.png');

    this.load.image('player-idle', 'sprites/fs-idle.png');
    this.load.image('player-look-1', 'sprites/fs-look-1.png');
    this.load.image('player-look-2', 'sprites/fs-look-2.png');
    this.load.image('player-look-3', 'sprites/fs-look-3.png');
    this.load.image('player-look-4', 'sprites/fs-look-4.png');
    this.load.image('player-hurt', 'sprites/fs-hurt.png');
    this.load.image('threat', 'sprites/fs-distorted.png');
    this.load.image('gem', 'sprites/gem.png');
    this.load.image('spikes', 'sprites/spikes.png');
    this.load.image('door', 'sprites/door.png');
    this.load.image('plat-grass', 'sprites/plat-grass.png');
    this.load.image('plat-stone', 'sprites/plat-stone.png');
    this.load.image('plat-void', 'sprites/plat-void.png');
    this.load.image('plat-blood', 'sprites/plat-blood.png');
  }

  create() { this.scene.start('MenuScene'); }
}
