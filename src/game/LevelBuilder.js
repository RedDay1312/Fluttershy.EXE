import Phaser from 'phaser';

export class LevelBuilder{
  constructor(scene,world){this.scene=scene;this.world=world;this.pickups=scene.physics.add.group();}
  build(){
    const s=this.scene,l=this.world.layout,c=this.world.chapter;
    for(const m of l.memories){const item=this.pickups.create(m.x,m.y,'memory').setDisplaySize(42,42);item.body.allowGravity=false;item.setData('memory',true);s.tweens.add({targets:item,y:m.y-16,duration:900+Phaser.Math.Between(0,500),yoyo:true,repeat:-1,ease:'Sine.easeInOut'});}
    return this;
  }
}
