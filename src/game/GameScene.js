import Phaser from 'phaser';
import { Player } from './Player.js';
import { GameState, beginChapter, collectMemory, onDeath } from './GameState.js';
import { getChapter } from './LevelData.js';
import { World } from './World.js';
import { LevelBuilder } from './LevelBuilder.js';
import { HUD } from './HUD.js';
import { HorrorDirector } from './HorrorDirector.js';
import { AudioEngine } from './AudioEngine.js';
import { writeSave } from './Storage.js';

export class GameScene extends Phaser.Scene{
  constructor(){super('game');}
  init(data){this.index=Number.isInteger(data?.chapter)?data.chapter:0;}
  create(){
    beginChapter(this.index); this.chapter=getChapter(this.index); this.cursors=this.input.keyboard.createCursorKeys();
    this.world=new World(this,this.index).build(); this.builder=new LevelBuilder(this,this.world).build();
    this.player=new Player(this,180,480); this.hud=new HUD(this); this.director=new HorrorDirector(this);
    this.physics.add.collider(this.player,this.world.platforms);
    this.physics.add.overlap(this.player,this.builder.pickups,(p,item)=>this.takeMemory(item));
    this.physics.add.overlap(this.player,this.world.traps,()=>this.damage());
    this.physics.add.overlap(this.player,this.world.exit,()=>this.tryExit());
    this.stalker=null;this.eyes=[];this.paused=false;this.pauseLayer=this.makePause();
    this.input.keyboard.on('keydown-ESC',()=>this.togglePause());this.hud.tell(this.chapter.message);AudioEngine.startAmbient();
  }
  takeMemory(item){if(!item.active)return;item.disableBody(true,true);collectMemory();AudioEngine.click();this.cameras.main.flash(100,210,220,190,false);this.hud.tell('Фрагмент памяти найден.');}
  damage(){if(this.player.invulnerable>0)return;this.player.invulnerable=900;this.player.setTexture('hurt');onDeath();writeSave(GameState);this.cameras.main.shake(280,.012);AudioEngine.scare();this.time.delayedCall(500,()=>this.scene.restart({chapter:this.index}));}
  tryExit(){if(GameState.memories<this.chapter.goal){this.hud.tell(`Дверь не открывается. Нужно ещё ${this.chapter.goal-GameState.memories}.`);return;}if(this.index<3)this.scene.start('game',{chapter:this.index+1});else this.scene.start('finale');}
  spawnEyes(){if(this.eyes.length)return;for(let i=0;i<5;i++){const e=this.add.image(this.player.x+Phaser.Math.Between(-600,600),Phaser.Math.Between(180,520),'eyes').setAlpha(0);e.setScale(.2);this.eyes.push(e);this.tweens.add({targets:e,alpha:.6,duration:500,delay:i*180,yoyo:true,hold:700});}}
  spawnStalker(){if(this.stalker)return;this.stalker=this.physics.add.image(this.player.x-700,500,'horror').setDisplaySize(150,150);this.stalker.body.allowGravity=false;this.stalker.setCollideWorldBounds(true);this.physics.add.overlap(this.player,this.stalker,()=>this.damage());}
  update(time,delta){if(this.paused)return;this.player.update(delta);this.director.update(delta,this.player,GameState);if(this.stalker){const d=this.player.x-this.stalker.x;this.stalker.body.setVelocityX(Phaser.Math.Clamp(d*.35,-150,150));this.stalker.flipX=d<0;}
    this.hud.show(this.chapter,GameState);if(this.player.y>760)this.damage();if(this.player.x>this.chapter.length-100)this.player.x=this.chapter.length-100;}
  togglePause(){this.paused=!this.paused;this.physics.world.isPaused=this.paused;this.pauseLayer.setVisible(this.paused);}
  makePause(){const c=this.add.container(0,0).setScrollFactor(0).setDepth(2000);const bg=this.add.rectangle(640,360,1280,720,0x020205,.82);const t=this.add.text(640,315,'ПАУЗА',{fontFamily:'Georgia',fontSize:44,color:'#deded5'}).setOrigin(.5);const s=this.add.text(640,375,'ESC — продолжить',{fontFamily:'monospace',fontSize:14,color:'#7f827a'}).setOrigin(.5);c.add([bg,t,s]);c.setVisible(false);return c;}
}
