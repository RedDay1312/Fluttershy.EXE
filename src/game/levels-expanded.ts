import { LEVELS, type Decor, type Hazard, type LevelDef, type Pickup, type Plat, type Trigger } from "./levels";

function cloneDecor(items: Decor[], offset: number, pass: number): Decor[] {
  return items.map((d) => ({
    ...d,
    x: d.x + offset,
    alpha: d.alpha == null ? undefined : Math.max(0.12, d.alpha * (pass === 1 ? 0.9 : pass === 2 ? 0.68 : 0.48)),
    flip: pass >= 2 ? !d.flip : d.flip,
  }));
}

function clonePlatforms(items: Plat[], offset: number, pass: number): Plat[] {
  return items.map((p) => ({
    ...p,
    x: p.x + offset,
    move: p.move
      ? { ...p.move, period: Math.max(1100, p.move.period * (pass === 1 ? 1 : pass === 2 ? 0.88 : 0.76)) }
      : undefined,
  }));
}

function cloneHazards(items: Hazard[], offset: number): Hazard[] {
  return items.map((h) => ({ ...h, x: h.x + offset }));
}

function clonePickups(items: Pickup[], offset: number, level: number, pass: number): Pickup[] {
  return items.map((p, i) => ({ ...p, x: p.x + offset, id: `${p.id}-echo-${level}-${pass}-${i}` }));
}

// Extra non-solid set dressing. It uses the sprites already shipped with the game,
// so the levels become much less repetitive without requiring new PNGs yet.
function atmosphericDecor(level: LevelDef, offset: number, pass: number): Decor[] {
  const w = level.width;
  const out: Decor[] = [];
  const corrupted = level.id >= 3 || pass >= 2;
  const severe = level.id >= 5 || pass >= 3;
  const add = (x: number, y: number, sprite: string, scale: number, depth = 7, alpha = 1, extra: Partial<Decor> = {}) => {
    out.push({ x: offset + x, y, sprite, scale, depth, alpha, ...extra });
  };

  // Big landmarks interrupt the repeating tree silhouettes.
  for (let x = 280; x < w - 180; x += 760) {
    if (level.id <= 2 && pass === 1) {
      add(x, 628, x % 1520 < 760 ? "cottage" : "sign", x % 1520 < 760 ? 0.34 : 0.75, 5, 0.82);
    } else if (level.id === 3) {
      add(x, 628, x % 1520 < 760 ? "poster" : "rock", x % 1520 < 760 ? 0.52 : 0.75, 5, 0.78);
      add(x + 150, 620, "mushroom", 0.62, 7, 0.7);
    } else if (corrupted) {
      add(x, 600, severe ? "fs-distorted" : "eyes", severe ? 0.52 : 0.7, 6, severe ? 0.16 : 0.5, severe ? { sway: true } : { follow: true, sway: true });
    }
  }

  // Ground clutter uses irregular spacing so the world does not look tiled.
  const clutterStep = level.id <= 2 ? 315 : level.id === 3 ? 260 : 390;
  for (let i = 0, x = 145; x < w - 120; i++, x += clutterStep) {
    const y = 625 + ((i * 37 + pass * 19) % 13);
    if (level.id === 1) {
      if (i % 3 === 0) add(x, y, "rock", 0.42 + (i % 2) * 0.12, 6, 0.72);
      if (i % 4 === 1) add(x + 48, y, "mushroom", 0.48, 7, 0.72, { sway: true });
    } else if (level.id === 2) {
      if (i % 3 === 0) add(x, y, "rock", 0.5, 6, 0.55);
      if (i % 4 === 2) add(x + 28, y - 8, "eyes", 0.42, 9, 0.28, { follow: true, sway: true });
    } else if (level.id === 3) {
      if (i % 3 === 0) add(x, y, "rock", 0.52, 6, 0.62);
      if (i % 4 === 0) add(x + 35, y, "mushroom", 0.44, 7, 0.58);
      if (i % 5 === 2) add(x + 75, 585, "eyes", 0.46, 9, 0.34, { follow: true, sway: true });
    } else {
      if (i % 2 === 0) add(x, y - 20, "eyes", severe ? 0.5 : 0.42, 9, severe ? 0.42 : 0.26, { follow: true, sway: true });
      if (i % 5 === 1) add(x + 70, 610, "poster", 0.36, 6, severe ? 0.3 : 0.46, { flip: i % 2 === 0 });
    }
  }

  // Watchers appear higher in the scene, becoming more obvious as corruption grows.
  const watcherCount = level.id <= 2 ? 3 + pass : 5 + pass * 2;
  for (let i = 0; i < watcherCount; i++) {
    const x = 420 + ((i * 733 + level.id * 211 + pass * 127) % Math.max(500, w - 650));
    const y = 220 + ((i * 91 + level.id * 43) % 260);
    const alpha = Math.min(0.58, 0.18 + level.id * 0.035 + pass * 0.045);
    add(x, y, "eyes", 0.38 + (i % 3) * 0.08, 10, alpha, { follow: true, sway: true });
  }
  return out;
}

function makeEchoTriggers(level: LevelDef, offset: number, pass: number): Trigger[] {
  const end = offset + level.width;
  return [
    { x: offset + 360, y: 0, w: 90, h: level.height, event: "whisper", once: true, key: pass === 1 ? "whisper.1" : pass === 2 ? "whisper.2" : "whisper.4" },
    { x: offset + Math.floor(level.width * 0.28), y: 0, w: 90, h: level.height, event: "shake", once: true },
    { x: offset + Math.floor(level.width * 0.52), y: 0, w: 90, h: level.height, event: pass >= 3 ? "black" : "glitch", once: true },
    { x: offset + Math.floor(level.width * 0.74), y: 0, w: 90, h: level.height, event: pass >= 2 ? "stare" : "shake", once: true, key: "Флаттершай: Я уже проходила это место... почему оно снова здесь?" },
    { x: end - 420, y: 0, w: 110, h: level.height, event: pass >= 3 ? "distort" : "glitch", once: true },
  ];
}

function addGroundSpikes(platforms: Plat[], offset: number, level: number, pass: number): Hazard[] {
  const hazards: Hazard[] = [];
  const sourceWidth = LEVELS[level - 1]?.width ?? 0;
  if (!sourceWidth) return hazards;
  for (const platform of platforms) {
    if (platform.h < 100 || platform.w < 520) continue;
    const start = Math.max(platform.x + 230, offset + 260);
    const end = Math.min(platform.x + platform.w - 220, offset + sourceWidth - 260);
    const spacing = pass === 1 ? (level >= 5 ? 560 : 760) : pass === 2 ? (level >= 5 ? 470 : 650) : (level >= 5 ? 390 : 560);
    for (let x = start; x < end; x += spacing) hazards.push({ x, y: platform.y - 45, w: 56, h: 45, kind: "spikes" });
  }
  return hazards;
}

export const EXPANDED_LEVELS: LevelDef[] = LEVELS.map((level) => {
  const section = level.width;
  const offsets = [section, section * 2, section * 3];
  const echoPlatforms = offsets.flatMap((offset, index) => clonePlatforms(level.platforms, offset, index + 1));
  const echoHazards = offsets.flatMap((offset) => cloneHazards(level.hazards, offset));
  const extraHazards = offsets.flatMap((offset, index) => addGroundSpikes(clonePlatforms(level.platforms, offset, index + 1), offset, level.id, index + 1));
  const echoPickups = offsets.flatMap((offset, index) => clonePickups(level.pickups, offset, level.id, index + 1));
  const echoDecor = offsets.flatMap((offset, index) => [
    ...cloneDecor(level.decor, offset, index + 1),
    ...atmosphericDecor(level, offset, index + 1),
  ]);
  const echoEvents = offsets.flatMap((offset, index) => makeEchoTriggers(level, offset, index + 1));

  return {
    ...level,
    width: section * 4,
    exit: { ...level.exit, x: section * 4 - 150 },
    platforms: [...level.platforms, ...echoPlatforms],
    hazards: [...level.hazards, ...echoHazards, ...extraHazards],
    pickups: [...level.pickups, ...echoPickups],
    decor: [...level.decor, ...atmosphericDecor(level, 0, 0), ...echoDecor],
    triggers: [...level.triggers, ...echoEvents],
    checkpoints: [
      ...level.checkpoints,
      ...offsets.flatMap((offset) => level.checkpoints.map((c) => ({ x: c.x + offset, y: c.y }))),
    ],
  };
});

export function getExpandedLevel(id: number): LevelDef {
  return EXPANDED_LEVELS.find((level) => level.id === id) ?? EXPANDED_LEVELS[0];
}
