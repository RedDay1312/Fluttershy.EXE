import Phaser from 'phaser';
import { resetGame } from './GameState.js';
import { AudioEngine } from './AudioEngine.js';

export class MenuScene extends Phaser.Scene {
  constructor(){ super('menu'); }
  create(){
    resetGame();
    AudioEngine.startAmbient();
    this.cameras.main.setBackgroundColor('#05050a');
    const g=this.add.graphics();
    g.fillGradientStyle(0x05050a,0x090b08,0x020204,0x060207,1).fillRect(0,0,1280,720);
    for(let i=0;i<90;i++){
      const x=Phaser.Math.Between(0,1280), y=Phaser.Math.Between(0,720), r=Phaser.Math.FloatBetween(.4,2.2);
      this.add.circle(x,y,r,0xb5c3a0,Phaser.Math.FloatBetween(.03,.16));
    }
    this.add.image(990,560,'horror').setAlpha(.08).setScale(.8).setAngle(-4);
    this.add.text(92,92,'FLUTTERSHY.EXE',{fontFamily:'Georgia',fontSize:58,color:'#dedccf',fontStyle:'bold',letterSpacing:3});
    this.add.text(96,165,'REBORN',{fontFamily:'monospace',fontSize:18,color:'#7d856d',letterSpacing:9});
    this.add.text(96,245,'Ты помнишь сад.\nСад помнит тебя.',{fontFamily:'Georgia',fontSize:28,color:'#aaa99f',lineSpacing:10});
    const button=this.add.text(96,390,'[ НАЧАТЬ ]',{fontFamily:'monospace',fontSize:24,color:'#e9e8df',backgroundColor:'#17191a',padding:{x:22,y:14}}).setInteractive({useHandCursor:true});
    button.on('pointerover',()=>button.setStyle({color:'#d8e5a4'}));
    button.on('pointerout',()=>button.setStyle({color:'#e9e8df'}));
    button.on('pointerdown',()=>{ AudioEngine.click(); this.scene.start('game',{chapter:0}); });
    this.add.text(98,480,'A / D или ← / → — движение\nПРОБЕЛ — прыжок    E — взаимодействие    ESC — пауза',{fontFamily:'monospace',fontSize:13,color:'#666b61',lineSpacing:9});
    this.add.text(96,620,'Это не обычный platformer. Страх меняет мир.',{fontFamily:'monospace',fontSize:12,color:'#4d514c'});
    this.input.keyboard.on('keydown-ENTER',()=>button.emit('pointerdown'));
  }
}
