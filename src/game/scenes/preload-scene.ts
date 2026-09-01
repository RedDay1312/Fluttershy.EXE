import * as Phaser from "phaser";
import { bridge } from "../bridge";

export class PreloadScene extends Phaser.Scene {
  private loadErrors: string[] = [];
  private status?: Phaser.GameObjects.Text;
  private bar?: Phaser.GameObjects.Rectangle;

  constructor() { super("preload"); }

  preload() {
    const w = this.scale.width;
    const h = this.scale.height;
    this.add.rectangle(0, 0, w, h, 0x07070a).setOrigin(0);
    this.add.text(w / 2, h / 2 - 48, "FLUTTERSHY.EXE", {
      fontFamily: "Cormorant Garamond, serif", fontSize: "48px", color: "#efe6d6"
    }).setOrigin(0.5);
    this.status = this.add.text(w / 2, h / 2 - 8, "loading...", {
      fontFamily: "IBM Plex Sans, sans-serif", fontSize: "14px", color: "#9a9388"
    }).setOrigin(0.5);
    this.add.rectangle(w / 2, h / 2 + 36, 420, 8, 0x2a2a32).setOrigin(0.5);
    this.bar = this.add.rectangle(w / 2 - 210, h / 2 + 36, 4, 8, 0x7ec8c9).setOrigin(0, 0.5);

    this.load.on("progress", (v: number) => {
      if (this.bar) this.bar.width = 420 * v;
      if (this.status) this.status.setText(`loading... ${Math.round(v * 100)}%`);
    });
    this.load.on("loaderror", (file: Phaser.Loader.File) => {
      const key = file.key || "unknown";
      const url = file.src || "unknown";
      this.loadErrors.push(`${key}: ${url}`);
      console.error("[Fluttershy.EXE] Asset failed to load:", key, url);
    });

    const sheets: [string, string, number, number][] = [
      ["fs-idle", "/sprites/fs-idle.png", 128, 128],
      ["fs-run", "/sprites/fs-run.png", 128, 128],
      ["fs-jump", "/sprites/fs-jump.png", 128, 128],
      ["fs-look", "/sprites/fs-look.png", 128, 128],
      ["fs-hurt", "/sprites/fs-hurt.png", 128, 128],
      ["fs-distorted", "/sprites/fs-distorted.png", 128, 128],
      ["butterflies", "/sprites/butterflies.png", 64, 64],
    ];
    sheets.forEach(([k, u, fw, fh]) => this.load.spritesheet(k, u, { frameWidth: fw, frameHeight: fh }));

    const images = [
      "fs-portrait", "fs-horror", "note", "flower", "door", "eyes", "spikes", "puddle", "flag",
      "plat-grass", "plat-wood", "plat-stone", "plat-blood", "plat-glitch", "plat-void",
      "tree-1", "tree-2", "tree-3", "bush", "grass", "rock", "mushroom", "vignette", "px",
      "fg-grass", "cottage", "sign", "letter", "cutie", "gem", "poster"
    ];
    images.forEach((k) => this.load.image(k, `/sprites/${k}.png`));

    const pngMaps = new Set(["fog-overlay", "blood-fog"]);
    const maps = ["forest-sky", "forest-far", "fog-sky", "fog-far", "fog-overlay", "blood-sky", "blood-far", "blood-fog", "void-sky", "void-far", "glitch-far", "finale-sky", "desktop-corrupt"];
    maps.forEach((k) => this.load.image(k, `/maps/${k}.${pngMaps.has(k) ? "png" : "jpg"}`));
  }

  create() {
    if (this.loadErrors.length) {
      const details = this.loadErrors.slice(0, 6).join("\n");
      this.status?.setColor("#ff6b6b").setText(`asset error\n${details}`);
      bridge.emit({ type: "game-error", message: `Asset loading failed:\n${details}` });
      return;
    }

    const mk = (key: string, tex: string, end: number, rate: number, repeat: number) => {
      if (this.anims.exists(key)) return;
      const texture = this.textures.get(tex);
      if (!texture || texture.key === "__MISSING") {
        throw new Error(`Required texture missing: ${tex}`);
      }
      this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start: 0, end }), frameRate: rate, repeat });
    };
    mk("fs-idle-anim", "fs-idle", 3, 5, -1);
    mk("fs-run-anim", "fs-run", 5, 11, -1);
    mk("fs-jump-anim", "fs-jump", 3, 8, 0);
    mk("fs-look-anim", "fs-look", 3, 4, 0);
    mk("fs-hurt-anim", "fs-hurt", 3, 8, 0);
    mk("fs-dist-anim", "fs-distorted", 3, 5, -1);
    mk("bfly-anim", "butterflies", 3, 8, -1);
    bridge.emit({ type: "loaded" });
    const level = (this.registry.get("startLevel") as number) || 1;
    this.scene.start("play", { level });
  }
}
