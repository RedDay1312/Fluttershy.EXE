import * as Phaser from "phaser";
import { bridge } from "../bridge";
import { EXPANDED_LEVELS } from "../levels-expanded";
import { installEquestriaDetails } from "../equestria-details";

export class PreloadScene extends Phaser.Scene {
  private loadErrors: string[] = [];
  private status?: Phaser.GameObjects.Text;
  private bar?: Phaser.GameObjects.Rectangle;

  constructor() {
    super("preload");
  }

  preload() {
    installEquestriaDetails(EXPANDED_LEVELS);

    const w = this.scale.width;
    const h = this.scale.height;
    this.add.rectangle(0, 0, w, h, 0x07070a).setOrigin(0);
    this.add.text(w / 2, h / 2 - 48, "FLUTTERSHY.EXE", {
      fontFamily: "Cormorant Garamond, serif",
      fontSize: "48px",
      color: "#efe6d6",
    }).setOrigin(0.5);
    this.status = this.add.text(w / 2, h / 2 - 8, "loading...", {
      fontFamily: "IBM Plex Sans, sans-serif",
      fontSize: "14px",
      color: "#9a9388",
      align: "center",
      wordWrap: { width: 900 },
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
    const sheetKeys = new Set(sheets.map(([k]) => k));

    const svgImages = new Set([
      "ponyville-cottage-new", "ponyville-cottage-corrupt", "cloud-rainbow-new", "apple-basket-new",
      "harmony-case-new", "harmony-case-corrupt", "equestria-road-sign-new", "equestria-road-sign-corrupt",
    ]);
    const images = new Set([
      "fs-portrait", "fs-horror", "note", "flower", "door", "eyes", "spikes", "puddle", "flag",
      "plat-grass", "plat-wood", "plat-stone", "plat-blood", "plat-glitch", "plat-void",
      "tree-1", "tree-2", "tree-3", "bush", "grass", "rock", "mushroom", "vignette", "px",
      "fg-grass", "cottage", "sign", "letter", "cutie", "gem", "poster",
      "hang-orange", "hang-pink", "hang-purple", "hang-yellow", "skull", ...svgImages,
    ]);

    for (const level of EXPANDED_LEVELS) {
      for (const decor of level.decor) images.add(decor.sprite);
    }
    images.forEach((k) => {
      if (sheetKeys.has(k)) return;
      this.load.image(k, `/sprites/${k}.${svgImages.has(k) ? "svg" : "png"}`);
    });

    const pngMaps = new Set(["fog-overlay", "blood-fog"]);
    const maps = new Set([
      "forest-sky", "forest-far", "fog-sky", "fog-far", "fog-overlay", "blood-sky", "blood-far",
      "blood-fog", "void-sky", "void-far", "glitch-far", "finale-sky", "desktop-corrupt",
    ]);
    for (const level of EXPANDED_LEVELS) {
      for (const path of [level.sky, level.far, level.fog]) {
        if (!path) continue;
        const key = path.split("/").pop()?.replace(/\.(jpg|jpeg|png)$/i, "");
        if (key) maps.add(key);
      }
    }
    maps.forEach((k) => this.load.image(k, `/maps/${k}.${pngMaps.has(k) ? "png" : "jpg"}`));
  }

  create() {
    const requiredKeys = new Set(["fs-idle", "fs-run", "fs-jump", "fs-look", "fs-hurt", "fs-distorted", "butterflies"]);
    const fatalErrors = this.loadErrors.filter((entry) => requiredKeys.has(entry.split(":", 1)[0]));

    if (fatalErrors.length) {
      const details = fatalErrors.slice(0, 8).join("\n");
      this.status?.setColor("#ff6b6b").setText(`PLAYER ASSET ERROR\n\n${details}\n\nOpen DevTools (F12) → Console for details.`);
      console.error("[Fluttershy.EXE] Required player assets failed:", fatalErrors);
      return;
    }

    if (this.loadErrors.length) {
      console.warn("[Fluttershy.EXE] Continuing with optional asset failures:", this.loadErrors);
      this.status?.setText("loading... starting with reduced visuals");
    }

    const mk = (key: string, tex: string, end: number, rate: number, repeat: number) => {
      if (this.anims.exists(key)) return true;
      const texture = this.textures.get(tex);
      if (!texture || texture.key === "__MISSING") {
        console.error(`[Fluttershy.EXE] Missing animation texture: ${tex}`);
        return false;
      }
      this.anims.create({ key, frames: this.anims.generateFrameNumbers(tex, { start: 0, end }), frameRate: rate, repeat });
      return true;
    };

    const animationsOk = [
      mk("fs-idle-anim", "fs-idle", 3, 5, -1),
      mk("fs-run-anim", "fs-run", 5, 11, -1),
      mk("fs-jump-anim", "fs-jump", 3, 8, 0),
      mk("fs-look-anim", "fs-look", 3, 4, 0),
      mk("fs-hurt-anim", "fs-hurt", 3, 8, 0),
      mk("fs-dist-anim", "fs-distorted", 3, 5, -1),
      mk("bfly-anim", "butterflies", 3, 8, -1),
    ].every(Boolean);

    if (!animationsOk) {
      this.status?.setColor("#ff6b6b").setText("ANIMATION ERROR\n\nRequired player animation could not be created.");
      return;
    }

    bridge.emit({ type: "loaded" });
    const level = (this.registry.get("startLevel") as number) || 1;
    this.scene.start("play", { level });
  }
}
