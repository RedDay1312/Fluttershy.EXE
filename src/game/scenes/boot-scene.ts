import * as Phaser from "phaser";
import { loadSave, writeSave } from "../save";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  create() {
    const save = loadSave();

    // Show the splash only once. Subsequent launches go straight to loading.
    if (!save.seenIntro) {
      save.seenIntro = true;
      writeSave(save);
      this.scene.start("splash");
      return;
    }

    this.scene.start("preload");
  }
}
