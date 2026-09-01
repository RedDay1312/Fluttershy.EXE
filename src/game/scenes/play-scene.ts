import * as Phaser from "phaser";
import { bridge } from "../bridge";
import { installControlsTest } from "../controls-test";
import { playSfx, setMusicBed, hushMusic } from "../audio";
import { readActions } from "../input";
import { getExpandedLevel, type LevelDef, type Plat } from "../levels-expanded";
import { Pony } from "../player";
import { useGameStore } from "@/store/game-store";

type Mover = {
  spr: Phaser.GameObjects.TileSprite;
  body: Phaser.Physics.Arcade.Body;
  ox: number;
  oy: number;
  dx: number;
  dy: number;
  period: number;
  t: number;
};

const DEATH_KEYS = ["d.death", "d.death.2", "d.death.3", "d.death.4"];

export class PlayScene extends Phaser.Scene {
  pony!: Pony;
  level!: LevelDef;
  solids!: Phaser.Physics.Arcade.StaticGroup;
  oneWays!: Phaser.Physics.Arcade.StaticGroup;
  moversGroup!: Phaser.Physics.Arcade.Group;
  hazards!: Phaser.Physics.Arcade.StaticGroup;
  pickups!: Phaser.Physics.Arcade.Group;
  exitZone!: Phaser.GameObjects.Zone;
  fired = new Set<string>();
  spawn = { x: 140, y: 500 };
  dropThrough = 0;
  distortOn = false;
  flicker: Phaser.GameObjects.TileSprite[] = [];
  fog?: Phaser.GameObjects.Image;
  pausedLogic = false;
  watchers: Phaser.GameObjects.Image[] = [];
  movers: Mover[] = [];
  dust?: Phaser.GameObjects.Particles.ParticleEmitter;
  motes?: Phaser.GameObjects.Particles.ParticleEmitter;
  lastDeathTalk = -1;
  ambientLookAt = 0;
  npcHint?: Phaser.GameObjects.Text;
  nearNpc: { nameKey: string; lineKey: string } | null = null;
  spokenNpc = new Set<string>();

  constructor() {
    super("play");
  }

  init(data: { level?: number }) {
    this.fired = new Set();
    this.dropThrough = 0;
    this.distortOn = false;
    this.flicker = [];
    this.watchers = [];
    this.movers = [];
    this.pausedLogic = false;
    this.lastDeathTalk = -1;
    this.ambientLookAt = 0;
    this.spokenNpc = new Set();
    this.nearNpc = null;
    const id = data.level ?? (this.registry.get("startLevel") as number) ?? 1;
    this.level = getExpandedLevel(id);
    this.spawn = { ...this.level.spawn };
    const cp = useGameStore.getState().checkpoint;
    if (cp && cp.level === this.level.id && cp.x > 40) {
      this.spawn = { x: cp.x, y: cp.y };
    }
    this.registry.set("startLevel", this.level.id);
  }

  create() {
    const L = this.level;
    this.physics.world.setBounds(0, 0, L.width, 900);
    this.cameras.main.setBounds(0, 0, L.width, L.height);
    this.cameras.main.setDeadzone(180, 90);
    this.cameras.main.roundPixels = true;

    const sky = this.add.image(0, 0, this.texKey(L.sky)).setOrigin(0, 0).setScrollFactor(0.08).setDepth(-20);
    sky.setDisplaySize(Math.max(L.width, 1800), L.height);
    const far = this.add.image(0, 20, this.texKey(L.far)).setOrigin(0, 0).setScrollFactor(0.32).setDepth(-15);
    far.setDisplaySize(Math.max(L.width * 0.75, 1600), L.height * 0.98);
    if (L.fog) {
      this.fog = this.add.image(0, 0, this.texKey(L.fog)).setOrigin(0, 0).setScrollFactor(0).setDepth(40);
      this.fog.setDisplaySize(1280, 720);
      this.fog.setAlpha(0.72);
    }

    this.solids = this.physics.add.staticGroup();
    this.oneWays = this.physics.add.staticGroup();
    this.moversGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.hazards = this.physics.add.staticGroup();
    this.pickups = this.physics.add.group({ allowGravity: false });

    L.platforms.forEach((p) => this.spawnPlat(p));
    L.hazards.forEach((h) => {
      if (h.kind === "pit") return;
      const key = h.kind === "spikes" ? "spikes" : "puddle";
      const s = this.add.tileSprite(h.x, h.y, h.w, h.h, key).setOrigin(0, 0).setDepth(8);
      this.physics.add.existing(s, true);
      s.setData("kind", h.kind);
      this.hazards.add(s);
    });

    L.pickups.forEach((c) => {
      if (useGameStore.getState().notes.includes(c.id) && (c.kind === "note" || c.kind === "letter" || c.kind === "gem")) return;
      const key = c.kind === "butterfly" ? "butterflies" : c.kind === "note" ? "note" : c.kind === "letter" ? "letter" : c.kind === "gem" ? "gem" : c.kind === "mark" ? "cutie" : "flower";
      const spr = this.pickups.create(c.x, c.y, key) as Phaser.Physics.Arcade.Sprite;
      spr.setOrigin(0.5, 1);
      spr.setData("kind", c.kind);
      spr.setData("id", c.id);
      spr.setDepth(12);
      if (c.kind === "butterfly") { spr.play("bfly-anim"); spr.setDisplaySize(48, 48); }
      else if (c.kind === "note") spr.setDisplaySize(36, 42);
      else if (c.kind === "letter") spr.setDisplaySize(44, 50);
      else if (c.kind === "gem" || c.kind === "mark") spr.setDisplaySize(40, 40);
      else spr.setDisplaySize(40, 48);
      this.tweens.add({ targets: spr, y: c.y - 10, duration: 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    });

    L.decor.forEach((d) => {
      const img = this.add.image(d.x, d.y, d.sprite).setOrigin(0.5, 1).setDepth(d.depth ?? 6);
      if (d.scale) img.setScale(d.scale);
      if (d.flip) img.setFlipX(true);
      if (d.alpha != null) img.setAlpha(d.alpha);
      if (d.sprite === "eyes") img.setOrigin(0.5, 0.5);
      if (d.sprite.startsWith("hang-")) img.setOrigin(0.5, 0);
      if (d.sway) this.tweens.add({ targets: img, angle: { from: -5, to: 5 }, duration: 1600 + Math.random() * 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      if (d.follow) this.watchers.push(img);
    });

    L.npcs.forEach((n) => {
      const img = this.add.image(n.x, n.y, n.sprite).setOrigin(0.5, 0).setDepth(6);
      if (n.scale) img.setScale(n.scale);
      img.setData("nameKey", n.nameKey);
      img.setData("lineKey", n.lineKey);
      this.tweens.add({ targets: img, angle: { from: -6, to: 6 }, duration: 1800 + Math.random() * 800, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.watchers.push(img);
    });

    this.npcHint = this.add.text(0, 0, "E", {
      fontFamily: "IBM Plex Sans, sans-serif", fontSize: "14px", color: "#efe6d6", backgroundColor: "#12141acc", padding: { x: 6, y: 3 },
    }).setDepth(30).setOrigin(0.5, 1).setVisible(false);

    L.checkpoints.forEach((c) => this.add.image(c.x, c.y + 80, "flag").setOrigin(0.5, 1).setDepth(5).setDisplaySize(28, 44));

    const door = this.add.image(L.exit.x + L.exit.w / 2, L.exit.y + L.exit.h, "door").setOrigin(0.5, 1).setDepth(9);
    door.setDisplaySize(L.exit.w, L.exit.h);
    this.exitZone = this.add.zone(L.exit.x, L.exit.y, L.exit.w, L.exit.h).setOrigin(0, 0);
    this.physics.add.existing(this.exitZone, true);

    this.add.tileSprite(0, L.height - 36, L.width, 64, "fg-grass").setOrigin(0, 1).setScrollFactor(1.08).setDepth(28).setAlpha(L.id === 1 ? 0.85 : L.id === 2 ? 0.55 : 0.25);
    this.add.image(640, 360, "vignette").setScrollFactor(0).setDepth(45).setAlpha(L.id >= 3 ? 0.85 : 0.55);

    this.pony = new Pony(this, this.spawn.x, this.spawn.y);
    this.pony.canWallJump = L.id >= 4;
    if (L.id >= 6) this.pony.setDistorted(true);
    this.pony.onJump = () => playSfx("jump");
    this.pony.onLand = () => { playSfx("land"); this.dust?.explode(7, this.pony.sprite.x, this.pony.sprite.y + 28); };
    this.pony.onLook = () => { hushMusic(1.6); playSfx("whisper"); };
    this.cameras.main.startFollow(this.pony.sprite, true, 0.14, 0.1);
    this.cameras.main.setFollowOffset(-80, 40);

    this.physics.add.collider(this.pony.sprite, this.solids);
    this.physics.add.collider(this.pony.sprite, this.moversGroup);
    this.physics.add.collider(this.pony.sprite, this.oneWays, undefined, (_p, plat) => {
      if (this.dropThrough > 0) return false;
      const pb = this.pony.sprite.body as Phaser.Physics.Arcade.Body;
      const tb = (plat as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.StaticBody;
      return pb.velocity.y >= 0 && pb.bottom <= tb.top + 14;
    });
    this.physics.add.overlap(this.pony.sprite, this.pickups, (_p, item) => {
      const s = item as Phaser.Physics.Arcade.Sprite;
      const kind = s.getData("kind") as PickupKind;
      const id = s.getData("id") as string;
      s.destroy();
      playSfx("collect");
      if (kind === "note" || kind === "letter" || kind === "gem") bridge.emit({ type: "note", id });
      else if (kind === "mark") { bridge.emit({ type: "collect", kind: "mark" }); bridge.emit({ type: "toast", key: "toast.mark" }); }
      else if (kind === "butterfly") { bridge.emit({ type: "collect", kind: "butterfly" }); if (this.level.id >= 3 && Math.random() < 0.45) { playSfx("whisper"); bridge.emit({ type: "whisper", key: "whisper.3" }); } }
      else bridge.emit({ type: "collect", kind: "flower" });
    });
    this.physics.add.overlap(this.pony.sprite, this.hazards, () => this.kill());
    this.physics.add.overlap(this.pony.sprite, this.exitZone, () => this.clearLevel());

    this.dust = this.add.particles(0, 0, "px", { lifespan: 420, speedY: { min: -40, max: -8 }, speedX: { min: -50, max: 50 }, scale: { start: 1.6, end: 0.2 }, alpha: { start: 0.45, end: 0 }, emitting: false, tint: L.id >= 3 ? 0x6a1818 : 0xc8b48a });
    this.dust.setDepth(18);
    const tint = L.id >= 6 ? 0x8822aa : L.id >= 3 ? 0x9a2430 : L.id === 2 ? 0xb8c4c8 : 0xffe08a;
    this.motes = this.add.particles(0, 0, "px", { x: { min: 0, max: 1280 }, y: { min: 0, max: 720 }, lifespan: 5000, speedY: { min: L.id >= 3 ? 20 : -18, max: L.id >= 3 ? 70 : 10 }, scale: { start: 1.4, end: 0.2 }, alpha: { start: 0.28, end: 0 }, quantity: 1, frequency: L.id >= 4 ? 70 : 180, tint, blendMode: L.id >= 4 ? "ADD" : "NORMAL" });
    this.motes.setScrollFactor(0).setDepth(36);

    if (L.id === 1) for (let i = 0; i < 5; i++) {
      const b = this.add.sprite(200 + i * 700, 180 + (i % 3) * 40, "butterflies", 0).setDepth(11);
      b.play("bfly-anim"); b.setDisplaySize(36, 36); b.setScrollFactor(0.55);
      this.tweens.add({ targets: b, x: b.x + 160, y: b.y - 20, duration: 4200 + i * 400, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    }

    installControlsTest(() => this.pony);
    setMusicBed(L.id);
    useGameStore.getState().setLevel(L.id);

    if (L.intro.length && !this.fired.has("intro")) {
      const tryIntro = () => {
        if (!useGameStore.getState().sessionStarted) { this.time.delayedCall(200, tryIntro); return; }
        this.fired.add("intro");
        useGameStore.getState().queueDialogue(L.intro.map((key) => ({ key, speaker: "fs" as const })));
      };
      this.time.delayedCall(400, tryIntro);
    }

    this.events.once("shutdown", () => this.tweens.killAll());
  }

  private texKey(path: string) {
    const name = path.split("/").pop() ?? path;
    return name.replace(/\.(jpg|png)$/, "");
  }

  private spawnPlat(p: Plat) {
    const key = `plat-${p.tex}`;
    const tile = this.add.tileSprite(p.x, p.y, p.w, p.h, key).setOrigin(0, 0).setDepth(4);
    if (p.move) {
      this.physics.add.existing(tile, false);
      const body = tile.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false); body.setImmovable(true); body.setSize(p.w, p.h);
      this.moversGroup.add(tile);
      this.movers.push({ spr: tile, body, ox: p.x, oy: p.y, dx: p.move.dx, dy: p.move.dy, period: p.move.period / 1000, t: 0 });
      return;
    }
    this.physics.add.existing(tile, true);
    const body = tile.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();
    if (p.oneWay) this.oneWays.add(tile); else this.solids.add(tile);
    if (this.level.id === 4 && p.oneWay) this.flicker.push(tile);
  }

  private kill() {
    if (this.pony.dead || this.pausedLogic) return;
    this.pony.dead = true; this.pony.hurt(); playSfx("hurt"); this.cameras.main.shake(180, 0.006); bridge.emit({ type: "died" });
    const deaths = useGameStore.getState().deaths;
    if (deaths === 1 || deaths % 3 === 0) {
      this.lastDeathTalk = deaths;
      const key = DEATH_KEYS[Math.min(DEATH_KEYS.length - 1, Math.floor(deaths / 3))];
      this.time.delayedCall(280, () => bridge.emit({ type: "dialogue", key }));
    }
    this.time.delayedCall(520, () => { this.pony.respawn(this.spawn.x, this.spawn.y); if (this.level.id >= 6) this.pony.setDistorted(true); this.cameras.main.flash(200, 20, 0, 0); });
  }

  private clearLevel() {
    if (this.pausedLogic) return;
    this.pausedLogic = true;
    if (this.level.id >= 7) { bridge.emit({ type: "ending" }); return; }
    bridge.emit({ type: "level-clear", level: this.level.id });
    this.cameras.main.fade(700, 0, 0, 0);
    this.time.delayedCall(720, () => bridge.emit({ type: "interlude", after: this.level.id }));
  }

  private fireTrigger(t: LevelDef["triggers"][number], idx: number) {
    const id = `t${idx}`;
    if (t.once && this.fired.has(id)) return;
    const r = this.pony.sprite.getBounds();
    if (r.centerX < t.x || r.centerX > t.x + t.w) return;
    this.fired.add(id);
    switch (t.event) {
      case "dialogue": if (t.key) bridge.emit({ type: "dialogue", key: t.key }); break;
      case "look": this.pony.look(2400); hushMusic(2); playSfx("whisper"); if (t.key) bridge.emit({ type: "dialogue", key: t.key, look: true }); bridge.emit({ type: "overlay", kind: "look", ms: 1800 }); break;
      case "stare": this.pony.look(3200); hushMusic(3); playSfx("stare"); this.cameras.main.shake(400, 0.01); if (t.key) bridge.emit({ type: "dialogue", key: t.key, look: true }); bridge.emit({ type: "overlay", kind: "stare", ms: 2400 }); break;
      case "red": playSfx("stinger"); this.cameras.main.shake(200, 0.01); bridge.emit({ type: "overlay", kind: "red", textKey: t.key, ms: 1600 }); break;
      case "bsod": this.pausedLogic = true; this.physics.pause(); playSfx("stinger"); bridge.emit({ type: "overlay", kind: "bsod", textKey: "bsod.body", ms: 4200 }); this.time.delayedCall(4200, () => { this.physics.resume(); this.pausedLogic = false; bridge.emit({ type: "dialogue", key: "d.l4.after" }); }); break;
      case "freeze": this.pausedLogic = true; this.physics.pause(); playSfx("stinger"); bridge.emit({ type: "overlay", kind: "freeze", textKey: "freeze.body", ms: 7000 }); this.time.delayedCall(5200, () => { this.physics.resume(); this.pausedLogic = false; }); break;
      case "black": this.pausedLogic = true; this.physics.pause(); hushMusic(3); bridge.emit({ type: "overlay", kind: "black", textKey: t.key ?? "black.1", ms: 3800 }); this.time.delayedCall(3800, () => { this.physics.resume(); this.pausedLogic = false; }); break;
      case "glitch": playSfx("stinger"); this.cameras.main.shake(500, 0.012); bridge.emit({ type: "overlay", kind: "glitch", ms: 1400 }); bridge.emit({ type: "shake-window" }); break;
      case "whisper": playSfx("whisper"); if (t.key) bridge.emit({ type: "whisper", key: t.key }); break;
      case "shake": bridge.emit({ type: "shake-window" }); this.cameras.main.shake(400, 0.008); break;
      case "notepad": bridge.emit({ type: "overlay", kind: "notepad", textKey: t.key ?? "notepad.1", ms: 3200 }); break;
      case "windows": bridge.emit({ type: "overlay", kind: "windows", ms: 4000 }); break;
      case "cursor": bridge.emit({ type: "cursor-flee" }); break;
      case "desktop-pony": bridge.emit({ type: "desktop-pony" }); break;
      case "gravity": this.pony.gravitySign = -1; this.pony.sprite.setFlipY(true); this.time.delayedCall(2800, () => { this.pony.gravitySign = 1; this.pony.sprite.setFlipY(false); }); break;
      case "distort": this.distortOn = true; this.pony.setDistorted(true); this.cameras.main.shake(400, 0.008); playSfx("whisper"); break;
      case "angel-gone": break;
      case "ending": bridge.emit({ type: "ending" }); break;
    }
  }

  private updateNpcs(interact: boolean) {
    const px = this.pony.sprite.x, py = this.pony.sprite.y;
    let near: { x: number; y: number; nameKey: string; lineKey: string } | null = null;
    for (const n of this.level.npcs) {
      const dx = n.x - px, dy = n.y + 80 - py;
      if (dx * dx + dy * dy < 110 * 110) near = n;
    }
    this.nearNpc = near;
    if (this.npcHint) {
      if (near) { this.npcHint.setVisible(true); this.npcHint.setPosition(near.x, near.y + 160); }
      else this.npcHint.setVisible(false);
    }
    if (interact && near && !this.spokenNpc.has(near.nameKey)) {
      this.spokenNpc.add(near.nameKey); playSfx("whisper"); bridge.emit({ type: "dialogue", key: near.lineKey, speaker: "npc", nameKey: near.nameKey });
    }
  }

  update(_time: number, delta: number) {
    const dt = Math.min(delta, 50) / 1000;
    const store = useGameStore.getState();
    if (!store.sessionStarted) { this.pony.lock(true); return; }
    if (store.dialogue) {
      this.pony.lock(true); const actions = readActions();
      if (actions.jumpPressed || actions.pause || actions.interact) store.nudgeDialogue();
      return;
    }
    if (store.phase === "paused" || store.overlay.kind === "bsod" || store.overlay.kind === "freeze" || store.overlay.kind === "black" || store.overlay.kind === "stare") { this.pony.lock(true); return; }
    this.pony.lock(false);
    const actions = readActions();
    if (actions.pause) { bridge.emit({ type: "pause-request" }); return; }
    if (actions.down && actions.jumpPressed) this.dropThrough = 220;
    if (this.dropThrough > 0) this.dropThrough -= delta;
    if (!this.pausedLogic) this.pony.update(dt, actions);
    if (this.pony.sprite.y > 820) this.kill();

    this.level.checkpoints.forEach((c) => {
      if (Math.abs(this.pony.sprite.x - c.x) < 48 && this.pony.grounded() && this.spawn.x !== c.x) {
        this.spawn = { x: c.x, y: c.y }; bridge.emit({ type: "checkpoint", level: this.level.id, x: c.x, y: c.y });
      }
    });
    this.level.triggers.forEach((t, i) => this.fireTrigger(t, i));
    this.updateNpcs(actions.interact);

    this.flicker.forEach((p, i) => { const on = Math.sin(_time / 180 + i) > -0.65; p.setAlpha(on ? 1 : 0.15); (p.body as Phaser.Physics.Arcade.StaticBody).enable = on; });
    this.movers.forEach((m) => {
      m.t += dt; const u = (Math.sin((m.t / m.period) * Math.PI * 2) + 1) / 2;
      const nx = m.ox + m.dx * u, ny = m.oy + m.dy * u;
      const vx = (nx - m.spr.x) / Math.max(dt, 0.001), vy = (ny - m.spr.y) / Math.max(dt, 0.001);
      m.body.setVelocity(vx, vy); m.spr.x = nx; m.spr.y = ny;
    });
    if (this.fog) this.fog.setAlpha(0.55 + Math.sin(_time / 1400) * 0.12);
    const px = this.pony.sprite.x;
    this.watchers.forEach((w) => { w.setFlipX(px < w.x); if (w.texture.key === "eyes") w.setAlpha(0.55 + Math.sin(_time / 500 + w.x) * 0.35); });
    if (this.level.id >= 2) {
      this.ambientLookAt += delta;
      if (this.ambientLookAt > 22000 && this.pony.grounded() && !this.pony.looking) {
        this.ambientLookAt = 0; this.pony.look(1600);
        const wkey = this.level.id >= 6 ? "whisper.4" : this.level.id >= 5 ? "whisper.2" : "whisper.1";
        bridge.emit({ type: "whisper", key: wkey });
      }
    }
    if (this.level.id >= 4 && Math.random() < 0.004) this.cameras.main.shake(80, 0.002);
    this.cameras.main.setFollowOffset(this.pony.facing > 0 ? -90 : 90, 36);
  }
}

type PickupKind = "butterfly" | "note" | "flower" | "letter" | "gem" | "mark";
