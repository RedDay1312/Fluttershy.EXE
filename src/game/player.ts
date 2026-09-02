import * as Phaser from "phaser";
import type { Actions } from "./input";

const COYOTE = 110;
const BUFFER = 130;
const JUMP_V = -860;
const GRAV_UP = 1750;
const GRAV_DOWN = 2750;
const APEX = 90;
const MAX_FALL = 980;
const ACCEL = 2700;
const AIR_ACCEL = 1750;
const FRICTION = 2400;
const MAX_SPEED = 310;
const CUT = 0.48;
const WALL_JUMP = -780;
const RESPAWN_INVULN = 1250;

export class Pony {
  sprite: Phaser.Physics.Arcade.Sprite;
  coyote = 0;
  buffer = 0;
  looking = false;
  hurtT = 0;
  dead = false;
  distorted = false;
  gravitySign = 1;
  locked = false;
  facing = 1;
  wasGrounded = false;
  idleMs = 0;
  invulnerableMs = 0;
  canWallJump = false;
  jumpHeldPrev = false;
  onLand?: () => void;
  onJump?: () => void;
  onLook?: () => void;
  private feedbackTween?: Phaser.Tweens.Tween;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add.sprite(x, y, "fs-idle", 0);
    this.sprite.setDepth(20);
    this.sprite.setDisplaySize(112, 112);
    this.sprite.setSize(48, 38);
    this.sprite.setOffset(40, 78);
    this.sprite.setMaxVelocity(MAX_SPEED, MAX_FALL);
    this.sprite.setCollideWorldBounds(false);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    body.setDrag(0, 0);
    body.setAllowGravity(false);
    this.polishGrass(scene);
  }

  private polishGrass(scene: Phaser.Scene) {
    const children = scene.children.list;
    const platforms = children.filter((child) => {
      const key = (child as any).texture?.key;
      return typeof key === "string" && key.startsWith("plat-");
    }) as Phaser.GameObjects.GameObject[];

    for (const child of children) {
      const obj = child as Phaser.GameObjects.Image | Phaser.GameObjects.Sprite;
      if ((obj as any).texture?.key !== "grass") continue;
      const x = obj.x;
      const support = platforms
        .map((p: any) => {
          const b = p.getBounds();
          return { b, d: Math.abs((b.left + b.right) / 2 - x) };
        })
        .filter(({ b }) => x >= b.left - 6 && x <= b.right + 6)
        .sort((a, b) => a.d - b.d)[0];

      if (!support) {
        obj.setVisible(false);
        continue;
      }

      obj.y = support.b.top + 3 + Phaser.Math.Between(-3, 4);
      obj.x += Phaser.Math.Between(-16, 16);
      obj.setScale(Phaser.Math.FloatBetween(0.48, 0.72));
      obj.setFlipX(Math.random() > 0.5);
      obj.setDepth(8 + Phaser.Math.FloatBetween(0, 0.5));
    }
  }

  private isRespawnAreaSafe(scene: Phaser.Scene, x: number, y: number) {
    const bodyLeft = x - 24, bodyRight = x + 24, bodyTop = y + 78, bodyBottom = y + 116;
    return scene.children.list.every((child: any) => {
      const key = child?.texture?.key;
      if (key !== "spikes" && key !== "puddle") return true;
      const b = child.getBounds?.();
      if (!b) return true;
      return bodyRight < b.left + 4 || bodyLeft > b.right - 4 || bodyBottom < b.top + 4 || bodyTop > b.bottom - 4;
    });
  }

  private findSafeRespawn(scene: Phaser.Scene, x: number, y: number) {
    const platforms = scene.children.list
      .filter((child) => {
        const key = (child as any).texture?.key;
        return typeof key === "string" && key.startsWith("plat-");
      })
      .map((child: any) => ({ child, bounds: child.getBounds() }))
      .filter(({ bounds }) => bounds.width > 70 && bounds.height > 0);

    const candidates = platforms
      .filter(({ bounds }) => x >= bounds.left + 28 && x <= bounds.right - 28)
      .sort((a, b) => Math.abs(a.bounds.top - (y + 104)) - Math.abs(b.bounds.top - (y + 104)));

    const fallback = platforms
      .slice()
      .sort((a, b) => Math.abs((a.bounds.left + a.bounds.right) / 2 - x) - Math.abs((b.bounds.left + b.bounds.right) / 2 - x));

    for (const target of [...candidates, ...fallback]) {
      const safeX = Phaser.Math.Clamp(x, target.bounds.left + 28, target.bounds.right - 28);
      const safeY = target.bounds.top - 104;
      if (this.isRespawnAreaSafe(scene, safeX, safeY)) return { x: safeX, y: safeY };
    }

    return { x: Number.isFinite(x) ? x : 140, y: Number.isFinite(y) ? Math.min(y, 500) : 500 };
  }

  setDistorted(v: boolean) {
    this.distorted = v;
  }

  lock(v: boolean) {
    this.locked = v;
    if (v) {
      const body = this.sprite.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, 0);
    }
  }

  look(ms = 2200) {
    if (this.dead || this.invulnerableMs > 0) return;
    this.looking = true;
    this.lock(true);
    this.sprite.play("fs-look-anim", true);
    this.onLook?.();
    this.sprite.scene.time.delayedCall(ms, () => {
      if (!this.sprite.scene.scene.isActive() || this.dead) return;
      this.looking = false;
      this.lock(false);
    });
  }

  hurt() {
    if (this.hurtT > 0 || this.invulnerableMs > 0) return;
    this.hurtT = 420;
    this.sprite.play("fs-hurt-anim", true);
    this.sprite.setTint(0xff8888);
    this.sprite.scene.time.delayedCall(180, () => {
      if (this.sprite.scene.scene.isActive()) this.sprite.clearTint();
    });
  }

  respawn(x: number, y: number) {
    const safe = this.findSafeRespawn(this.sprite.scene, x, y);
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    this.feedbackTween?.stop();
    this.feedbackTween = undefined;
    this.dead = false;
    this.hurtT = 0;
    this.looking = false;
    this.locked = false;
    this.gravitySign = 1;
    this.idleMs = 0;
    this.coyote = 0;
    this.buffer = 0;
    this.wasGrounded = false;
    this.invulnerableMs = RESPAWN_INVULN;
    this.jumpHeldPrev = false;
    this.sprite.setPosition(safe.x, safe.y);
    body.reset(safe.x, safe.y);
    body.setEnable(true);
    body.setVelocity(0, 0);
    body.setAcceleration(0, 0);
    this.sprite.setAlpha(1);
    this.sprite.clearTint();
    this.sprite.setFlipY(false);
    this.sprite.setScale(1, 1);
  }

  grounded(): boolean {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    return this.gravitySign > 0 ? body.blocked.down || body.touching.down : body.blocked.up || body.touching.up;
  }

  update(dt: number, actions: Actions) {
    const body = this.sprite.body as Phaser.Physics.Arcade.Body;
    const ms = dt * 1000;
    if (this.hurtT > 0) this.hurtT -= ms;
    if (this.invulnerableMs > 0) {
      this.invulnerableMs = Math.max(0, this.invulnerableMs - ms);
      const pulse = 0.48 + Math.abs(Math.sin(this.invulnerableMs / 90)) * 0.52;
      this.sprite.setAlpha(this.invulnerableMs < 220 ? 1 : pulse);
    } else if (this.sprite.alpha !== 1) {
      this.sprite.setAlpha(1);
    }

    if (this.locked || this.dead) {
      body.setVelocityX(0);
      this.jumpHeldPrev = actions.jump;
      return;
    }

    const onGround = this.grounded();
    if (onGround) this.coyote = COYOTE;
    else this.coyote = Math.max(0, this.coyote - ms);

    if (actions.jumpPressed) this.buffer = BUFFER;
    else this.buffer = Math.max(0, this.buffer - ms);

    const accel = onGround ? ACCEL : AIR_ACCEL;
    if (actions.moveX !== 0) {
      body.setVelocityX(
        Phaser.Math.Clamp(body.velocity.x + actions.moveX * accel * dt, -MAX_SPEED, MAX_SPEED),
      );
      this.facing = actions.moveX > 0 ? 1 : -1;
      this.sprite.setFlipX(this.facing < 0);
    } else if (onGround) {
      const vx = body.velocity.x;
      const mag = Math.max(0, Math.abs(vx) - FRICTION * dt);
      body.setVelocityX(Math.sign(vx) * mag);
    }

    const canJump = this.coyote > 0;
    if (this.buffer > 0 && canJump) {
      body.setVelocityY(JUMP_V * this.gravitySign);
      this.coyote = 0;
      this.buffer = 0;
      this.playJumpFeedback();
      this.onJump?.();
    } else if (this.canWallJump && this.buffer > 0 && !onGround) {
      const wallL = body.blocked.left || body.touching.left;
      const wallR = body.blocked.right || body.touching.right;
      if (wallL || wallR) {
        const dir = wallL ? 1 : -1;
        body.setVelocityY(WALL_JUMP * this.gravitySign);
        body.setVelocityX(dir * MAX_SPEED);
        this.facing = dir;
        this.sprite.setFlipX(this.facing < 0);
        this.buffer = 0;
        this.coyote = 0;
        this.playJumpFeedback();
        this.onJump?.();
      }
    }

    if (!actions.jump && this.jumpHeldPrev && this.gravitySign * body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * CUT);
    }
    this.jumpHeldPrev = actions.jump;

    let g = GRAV_DOWN;
    const rising = this.gravitySign * body.velocity.y < 0;
    if (rising) g = GRAV_UP;
    if (Math.abs(body.velocity.y) < APEX) g *= 0.55;
    body.setVelocityY(body.velocity.y + g * this.gravitySign * dt);
    if (this.gravitySign > 0 && body.velocity.y > MAX_FALL) body.setVelocityY(MAX_FALL);
    if (this.gravitySign < 0 && body.velocity.y < -MAX_FALL) body.setVelocityY(-MAX_FALL);

    if (onGround && !this.wasGrounded) {
      if (Math.abs(body.velocity.x) > 70 || Math.abs(body.velocity.y) > 260) this.playLandingFeedback();
      this.onLand?.();
    }
    this.wasGrounded = onGround;

    this.animate(onGround, body.velocity.x, body.velocity.y);
  }

  private playJumpFeedback() {
    this.feedbackTween?.stop();
    this.sprite.setScale(0.91, 1.08);
    this.feedbackTween = this.sprite.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 150,
      ease: "Quad.easeOut",
    });
  }

  private playLandingFeedback() {
    this.feedbackTween?.stop();
    this.sprite.setScale(1.1, 0.9);
    this.feedbackTween = this.sprite.scene.tweens.add({
      targets: this.sprite,
      scaleX: 1,
      scaleY: 1,
      duration: 180,
      ease: "Back.easeOut",
    });
  }

  private animate(onGround: boolean, vx: number, vy: number) {
    if (this.looking || this.hurtT > 0) return;
    const idle = this.distorted ? "fs-dist-anim" : "fs-idle-anim";
    const run = this.distorted ? "fs-dist-anim" : "fs-run-anim";
    if (!onGround) {
      const frame = this.gravitySign * vy < 0 ? 1 : 3;
      this.sprite.anims.stop();
      this.sprite.setTexture(this.distorted ? "fs-distorted" : "fs-jump", frame);
      return;
    }
    if (Math.abs(vx) > 40) this.sprite.play(run, true);
    else this.sprite.play(idle, true);
  }
}
