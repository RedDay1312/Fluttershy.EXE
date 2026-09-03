import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor(){ super('boot'); }
  preload(){
    const assets = [
      ['flutter','sprites/fs-idle.png'],['run','sprites/fs-run.png'],['jump','sprites/fs-jump.png'],
      ['hurt','sprites/fs-hurt.png'],['horror','sprites/fs-horror.png'],['look','sprites/fs-look.png'],
      ['memory','sprites/gem.png'],['door','sprites/door.png'],['spikes','sprites/spikes.png'],
      ['grass','sprites/plat-grass.png'],['stone','sprites/plat-stone.png'],['void','sprites/plat-void.png'],
      ['blood','sprites/plat-blood.png'],['eyes','sprites/eyes.png'],['flower','sprites/flower.png'],
      ['skull','sprites/skull.png'],['mushroom','sprites/mushroom.png'],['rock','sprites/rock.png'],
      ['tree1','sprites/tree-1.png'],['tree2','sprites/tree-2.png'],['tree3','sprites/tree-3.png'],
      ['hangPink','sprites/hang-pink.png'],['hangPurple','sprites/hang-purple.png'],['hangOrange','sprites/hang-orange.png'],
      ['hangYellow','sprites/hang-yellow.png'],['hangBlue','sprites/hang-blue.png'],['hangWhite','sprites/hang-white.png'],
      ['fog','sprites/vignette.png']
    ];
    for (const [key,path] of assets) this.load.image(key, `/${path}`);
    const bar = this.add.graphics();
    this.load.on('progress', value => {
      bar.clear().fillStyle(0x6e7a55,1).fillRect(190,385,900*value,5);
    });
  }
  create(){
    this.registry.set('booted', true);
    this.scene.start('menu');
  }
}
