import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene,x,y){
    super(scene,x,y,'flutter');
    scene.add.existing(this); scene.physics.add.existing(this);
    this.setOrigin(.5,.75); this.setDisplaySize(112,112); this.setCollideWorldBounds(true);
    this.body.setSize(64,82).setOffset(24,28);
    this.speed=280; this.accel=1700; this.jump=620; this.coyote=0; this.jumpBuffer=0; this.invulnerable=0;
    this.keys=scene.input.keyboard.addKeys({left:'A',right:'D',up:'SPACE'});
  }
  update(dt){
    const {left,right,up}=this.keys, L=left.isDown||this.scene.cursors.left.isDown, R=right.isDown||this.scene.cursors.right.isDown;
    const J=Phaser.Input.Keyboard.JustDown(up)||Phaser.Input.Keyboard.JustDown(this.scene.cursors.up);
    const axis=(R?1:0)-(L?1:0);
    this.body.setAccelerationX(axis*this.accel);
    this.body.setMaxVelocity(this.speed,900);
    if(Math.abs(this.body.velocity.x)>this.speed) this.body.setVelocityX(Math.sign(this.body.velocity.x)*this.speed);
    if(this.body.blocked.down) this.coyote=110; else this.coyote-=dt;
    if(J) this.jumpBuffer=130; else this.jumpBuffer-=dt;
    if(this.jumpBuffer>0&&this.coyote>0){ this.setVelocityY(-this.jump); this.jumpBuffer=0; this.coyote=0; }
    if(!J&&this.body.velocity.y<0) this.body.velocity.y*=.82;
    if(Math.abs(this.body.velocity.x)>35&&this.body.blocked.down) this.setTexture('run');
    else if(!this.body.blocked.down) this.setTexture('jump');
    else this.setTexture('flutter');
    this.flipX=this.body.velocity.x<0;
    if(this.invulnerable>0) this.invulnerable-=dt;
  }
}
