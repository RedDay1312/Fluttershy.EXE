import * as Phaser from "phaser";

export class SplashScene extends Phaser.Scene {
  private finished = false;

  constructor() {
    super("splash");
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.rectangle(0, 0, width, height, 0x050607).setOrigin(0);

    const glow = this.add.rectangle(width / 2, height / 2, 1, 1, 0x8cc8b8, 0.12);
    glow.setScale(520, 520);

    const title = this.add
      .text(width / 2, height / 2 - 28, "FLUTTERSHY.EXE", {
        fontFamily: "Cormorant Garamond, Georgia, serif",
        fontSize: "64px",
        color: "#e9eee8",
        letterSpacing: 5,
        shadow: { color: "#8cc8b8", blur: 18, fill: true },
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const subtitle = this.add
      .text(width / 2, height / 2 + 38, "SHE FOUND A GAME ABOUT HERSELF", {
        fontFamily: "IBM Plex Sans, Arial, sans-serif",
        fontSize: "13px",
        color: "#8f9892",
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const warning = this.add
      .text(width / 2, height - 42, "PRESS ANY KEY TO CONTINUE", {
        fontFamily: "IBM Plex Sans, Arial, sans-serif",
        fontSize: "11px",
        color: "#626b66",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    this.tweens.add({ targets: title, alpha: 1, duration: 900, ease: "Sine.easeOut" });
    this.tweens.add({ targets: subtitle, alpha: 1, duration: 700, delay: 450, ease: "Sine.easeOut" });
    this.tweens.add({ targets: warning, alpha: 1, duration: 500, delay: 1100 });

    // Subtle EXE-style flicker without blocking the player.
    this.time.addEvent({
      delay: 180,
      loop: true,
      callback: () => {
        if (this.finished) return;
        title.x = width / 2 + Phaser.Math.Between(-1, 1);
        title.setAlpha(Phaser.Math.FloatBetween(0.94, 1));
      },
    });

    const finish = () => {
      if (this.finished) return;
      this.finished = true;
      this.cameras.main.fadeOut(450, 0, 0, 0);
      this.time.delayedCall(450, () => this.scene.start("preload"));
    };

    this.input.keyboard?.on("keydown", finish);
    this.input.on("pointerdown", finish);
    this.time.delayedCall(3200, finish);

    void bg;
  }
}
