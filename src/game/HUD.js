export class HUD{
  constructor(scene){
    this.scene=scene; const add=scene.add;
    this.root=add.container(0,0).setScrollFactor(0).setDepth(1000);
    this.title=add.text(28,22,'',{fontFamily:'monospace',fontSize:18,color:'#d9dccf'}); this.root.add(this.title);
    this.memory=add.text(28,50,'ПАМЯТЬ 0',{fontFamily:'monospace',fontSize:12,color:'#899080'}); this.root.add(this.memory);
    this.barBack=add.rectangle(1010,28,220,10,0x17191b).setOrigin(0,0); this.root.add(this.barBack);
    this.bar=add.rectangle(1010,28,1,10,0x8b3a49).setOrigin(0,0); this.root.add(this.bar);
    this.pause=add.text(1185,58,'ESC', {fontFamily:'monospace',fontSize:11,color:'#666b65'}).setOrigin(.5); this.root.add(this.pause);
    this.message=add.text(640,650,'',{fontFamily:'Georgia',fontSize:20,color:'#c3c3b9',align:'center',wordWrap:{width:900}}).setOrigin(.5).setAlpha(0); this.root.add(this.message);
  }
  show(chapter,state){this.title.setText(chapter.name);this.memory.setText(`ПАМЯТЬ ${state.memories} / ${chapter.goal}`);this.bar.width=220*Math.max(0,Math.min(1,state.fear/100));}
  tell(text){this.message.setText(text).setAlpha(1);this.scene.tweens.killTweensOf(this.message);this.scene.tweens.add({targets:this.message,alpha:0,delay:2200,duration:1300});}
}
