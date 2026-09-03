import Phaser from 'phaser';
import { GameState, markEnding } from './GameState.js';
import { AudioEngine } from './AudioEngine.js';
import { wipeSave } from './Storage.js';

export class FinaleScene extends Phaser.Scene{
  constructor(){super('finale');}
  create(){
    const complete=GameState.memories>=6 && GameState.deaths<4;
    const cracked=!complete && GameState.deaths<8;
    const ending=complete?'GOOD':cracked?'CRACKED':'LOST';markEnding(ending);wipeSave();
    this.cameras.main.setBackgroundColor(complete?'#11160f':cracked?'#130f13':'#080508');
    const g=this.add.graphics();g.fillGradientStyle(0x121812,0x050608,0x090408,0x010103,1).fillRect(0,0,1280,720);
    const portrait=complete?'flutter':cracked?'horror':'hurt';this.add.image(950,430,portrait).setDisplaySize(350,350).setAlpha(.7);
    const title=complete?'ТЫ ДОБРАЛАСЬ':cracked?'САД ОСТАЛСЯ ВНУТРИ':'ТЕБЯ БОЛЬШЕ НЕТ';
    const copy=complete?'На этот раз дверь была настоящей. И тишина закончилась.':cracked?'Ты вышла из сада, но он продолжает смотреть издалека.':'Ты слишком долго смотрела назад.';
    this.add.text(90,120,title,{fontFamily:'Georgia',fontSize:48,color:'#e3e2d8',fontStyle:'bold'});
    this.add.text(94,205,copy,{fontFamily:'Georgia',fontSize:23,color:'#aaa99f',wordWrap:{width:650},lineSpacing:9});
    this.add.text(94,330,`ФРАГМЕНТЫ: ${GameState.memories}\nСМЕРТИ: ${GameState.deaths}`,{fontFamily:'monospace',fontSize:15,color:'#777c72',lineSpacing:12});
    const b=this.add.text(94,490,'[ В ГЛАВНОЕ МЕНЮ ]',{fontFamily:'monospace',fontSize:18,color:'#ddd',backgroundColor:'#17181a',padding:{x:18,y:12}}).setInteractive({useHandCursor:true});
    b.on('pointerover',()=>b.setStyle({color:'#cfdc9f'}));b.on('pointerout',()=>b.setStyle({color:'#ddd'}));b.on('pointerdown',()=>{AudioEngine.click();this.scene.start('menu');});
  }
}
