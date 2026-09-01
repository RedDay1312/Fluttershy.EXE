import { LEVELS, type Decor, type Hazard, type LevelDef, type Pickup, type Plat, type Trigger } from "./levels";

/**
 * Expands each authored level into four readable sections.
 * The authored first section is preserved; the following sections are echoes
 * with progressively stronger corruption. Geometry is copied rather than
 * stretched so the original jump rhythm remains valid.
 */
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
  return items.map((p, i) => ({
    ...p,
    x: p.x + offset,
    id: `${p.id}-echo-${level}-${pass}-${i}`,
  }));
}

function makeEchoTriggers(level: LevelDef, offset: number, pass: number): Trigger[] {
  const end = offset + level.width;
  return [
    {
      x: offset + 360,
      y: 0,
      w: 90,
      h: level.height,
      event: "whisper",
      once: true,
      key: pass === 1 ? "whisper.1" : pass === 2 ? "whisper.2" : "whisper.4",
    },
    {
      x: offset + Math.floor(level.width * 0.28),
      y: 0,
      w: 90,
      h: level.height,
      event: "shake",
      once: true,
    },
    {
      x: offset + Math.floor(level.width * 0.52),
      y: 0,
      w: 90,
      h: level.height,
      event: pass >= 3 ? "black" : "glitch",
      once: true,
    },
    {
      x: offset + Math.floor(level.width * 0.74),
      y: 0,
      w: 90,
      h: level.height,
      event: pass >= 2 ? "stare" : "shake",
      once: true,
      key: "Флаттершай: Я уже проходила это место... почему оно снова здесь?",
    },
    {
      x: end - 420,
      y: 0,
      w: 110,
      h: level.height,
      event: pass >= 3 ? "distort" : "glitch",
      once: true,
    },
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
    const spacing = pass === 1
      ? (level >= 5 ? 560 : 760)
      : pass === 2
        ? (level >= 5 ? 470 : 650)
        : (level >= 5 ? 390 : 560);

    for (let x = start; x < end; x += spacing) {
      hazards.push({ x, y: platform.y - 45, w: 56, h: 45, kind: "spikes" });
    }
  }
  return hazards;
}

export const EXPANDED_LEVELS: LevelDef[] = LEVELS.map((level) => {
  const section = level.width;
  const offsets = [section, section * 2, section * 3];

  const echoPlatforms = offsets.flatMap((offset, index) =>
    clonePlatforms(level.platforms, offset, index + 1),
  );
  const echoHazards = offsets.flatMap((offset) => cloneHazards(level.hazards, offset));
  const extraHazards = offsets.flatMap((offset, index) => {
    const platforms = clonePlatforms(level.platforms, offset, index + 1);
    return addGroundSpikes(platforms, offset, level.id, index + 1);
  });
  const echoPickups = offsets.flatMap((offset, index) =>
    clonePickups(level.pickups, offset, level.id, index + 1),
  );
  const echoDecor = offsets.flatMap((offset, index) =>
    cloneDecor(level.decor, offset, index + 1, index + 1),
  );
  const echoEvents = offsets.flatMap((offset, index) =>
    makeEchoTriggers(level, offset, index + 1),
  );

  return {
    ...level,
    width: section * 4,
    exit: { ...level.exit, x: section * 4 - 150 },
    platforms: [...level.platforms, ...echoPlatforms],
    hazards: [...level.hazards, ...echoHazards, ...extraHazards],
    pickups: [...level.pickups, ...echoPickups],
    decor: [...level.decor, ...echoDecor],
    triggers: [...level.triggers, ...echoEvents],
    checkpoints: [
      ...level.checkpoints,
      ...offsets.flatMap((offset) =>
        level.checkpoints.map((c) => ({ x: c.x + offset, y: c.y })),
      ),
    ],
  };
});

export function getExpandedLevel(id: number): LevelDef {
  return EXPANDED_LEVELS.find((level) => level.id === id) ?? EXPANDED_LEVELS[0];
}
