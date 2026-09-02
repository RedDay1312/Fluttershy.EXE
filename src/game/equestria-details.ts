import type { LevelDef, Decor } from "./levels";

let installed = false;

function push(level: LevelDef, decor: Decor) {
  level.decor.push(decor);
}

export function installEquestriaDetails(levels: LevelDef[]) {
  if (installed) return;
  installed = true;

  for (const level of levels) {
    const corrupted = level.id >= 3;
    const severe = level.id >= 5;
    const section = Math.max(1, Math.floor(level.width / 4));
    const positions = [
      420,
      Math.min(section - 280, 1180),
      Math.min(section - 180, 1840),
      Math.min(section - 140, 2460),
    ].filter((x, index, arr) => x > 180 && arr.indexOf(x) === index);

    positions.forEach((x, index) => {
      const offset = index * section;
      const local = x;

      if (!corrupted) {
        push(level, { x: offset + local, y: 628, sprite: "ponyville-cottage-new", scale: 0.52, depth: 4, alpha: 0.96 });
        push(level, { x: offset + local + 150, y: 610, sprite: index % 2 ? "apple-basket-new" : "equestria-road-sign-new", scale: index % 2 ? 0.5 : 0.46, depth: 9, alpha: 0.95 });
        push(level, { x: offset + local + 340, y: 210, sprite: "cloud-rainbow-new", scale: 0.46, depth: 1, alpha: 0.88 });
        push(level, { x: offset + local + 500, y: 616, sprite: "harmony-case-new", scale: 0.42, depth: 9, alpha: 0.9 });
      } else {
        const cottage = severe ? "ponyville-cottage-corrupt" : "ponyville-cottage-new";
        const harmony = severe ? "harmony-case-corrupt" : "harmony-case-new";
        const sign = severe ? "equestria-road-sign-corrupt" : "equestria-road-sign-new";
        push(level, { x: offset + local, y: 628, sprite: cottage, scale: 0.52, depth: 4, alpha: severe ? 0.42 : 0.62, sway: severe });
        push(level, { x: offset + local + 170, y: 610, sprite: sign, scale: 0.46, depth: 9, alpha: severe ? 0.38 : 0.56, sway: severe });
        push(level, { x: offset + local + 360, y: 616, sprite: harmony, scale: 0.42, depth: 9, alpha: severe ? 0.34 : 0.5 });
        push(level, { x: offset + local + 490, y: 210, sprite: "cloud-rainbow-new", scale: 0.44, depth: 1, alpha: severe ? 0.16 : 0.34 });
      }
    });
  }
}
