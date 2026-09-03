import Phaser from 'phaser';
import { getChapter, buildLayout } from './LevelData.js';

export class World{
  constructor(scene,index){this.scene=scene;this.index=index;this.chapter=getChapter(index);this.layout=buildLayout(index);this.platforms=scene.physics.add.staticGroup();this.traps=scene.physics.add.staticGroup();}
  build(){
    const s=this.scene,c=this.chapter;
    s.physics.world.setBounds(0,0,c.length,720); s.cameras.main.setBounds(0,0,c.length,720);
    const bg=s.add.graphics();
    bg.fillGradientStyle(c.tone,0x05050a,0x09090d,0x020205,1).fillRect(0,0,c.length,720);
    for(let i=0;i<35;i++){const x=i*c.length/34;bg.fillStyle(c.tone,.09).fillCircle(x,390+(i%5)*45,80+(i%4)*30);}
    for(const p of this.layout.platforms){const floor=this.platforms.create(p.x,p.y,c.platform).setDisplaySize(p.w,p.h);floor.refreshBody();}
    const ground=this.platforms.create(c.length/2,675,c.platform).setDisplaySize(c.length,90);ground.refreshBody();
    for(const t of this.layout.traps){const trap=this.traps.create(t.x,t.y,'spikes').setDisplaySize(t.w,t.h);trap.refreshBody();trap.body.checkCollision.down=false;trap.setData('lethal',true);}
    for(let i=0;i<18;i++){const key=c.decor[i%c.decor.length];s.add.image(350+i*((c.length-600)/18),Phaser.Math.Between(190,560),key).setAlpha(.24).setScale(Phaser.Math.FloatBetween(.18,.42)).setDepth(-1);}
    this.exit=s.physics.add.staticImage(this.layout.exitX,575,'door').setDisplaySize(100,150);this.exit.refreshBody();
    return this;
  }
}
