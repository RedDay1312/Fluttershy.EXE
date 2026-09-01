import { LEVELS, type Decor, type Hazard, type LevelDef, type Pickup, type Plat, type Trigger } from "./levels";

/**
 * Turns each authored level into a long multi-section journey.
 * The original section stays intact, then three progressively corrupted
 * echoes are appended. Geometry is copied rather than stretched so the
 * platforming remains readable while the amount of exploration increases.
 */
function cloneDecor(items: Decor[], offset: number, level: number, pass: number): Decor[] {
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
    // Later echoes subtly alter moving-platform timing without changing jumps.
    move: p.move ? { ...p.move, period: Math.max(1100, p.move.period * (pass === 1 ? 1 : pass === 2 ? 0.88 : 0.76)) } : undefined,
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

function echoTriggers(level: LevelDef, offset: number, pass: number): Trigger[] {
  const end = offset + level.width;
  const triggers: Trigger[] = [
    { x: offset + 360, y: 0, w: 90, h: level.height, event: "whisper", once: true, key: pass === 1 ? "whisper.1" : pass === 2 ? "whisper.2" : "whisper.4" },
    { x: offset + Math.floor(level.width * 0.28), y: 0, w: 90, h: level.height, event: "shake", once: true },
    { x: offset + Math.floor(level.width * 0.52), y: 0, w: 90, h: level.height, event: pass >= 3 ? "black" : "glitch", once: true },
    { x: offset + Math.floor(level.width * 0.74), y: 0, w: 90, h: level.height, event: pass >= 2 ? "stare" : "shake", once: true, key: "Флаттершай: Я уже проходила это место... почему оно снова здесь?" },
    { x: end - 420, y: 0, w: 110, h: level.height, event: pass >= 3 ? "distort" : "glitch", once: true },
  ];
  return triggers;
}

function addGroundSpikes(platforms: Plat[], offset: number, level: number, pass: number): Hazard[] {
  const hazards: Hazard[] = [];
  for (const p of platforms) {
    if (p.h < 100 || p.w < 520) continue;
    const start = Math.max(p.x + 230, offset + 260);
    const end = Math.min(p.x + p.w - 220, offset + LEVELS[level - 1].width - 260);
    const spacing = pass === 1 ? (level >= 5 ? 560 : 760) : pass === 2 ? (level >= 5 ? 470 : 650) : (level >= 5 ? 390 : 560);
    for (let x = start; x < end; x += spacing) {
      hazards.push({ x, y: p.y - 45, w: 56, h: 45, kind: "spikes" });
    }
  }
  return hazards;
}

export const EXPANDED_LEVELS: LevelDef[] = LEVELS.map((level) => {
  const section = level.width;
  const offsets = [section, section * 2, section * 3];
  const echoPlatforms = offsets.flatMap((offset, i) => clonePlatforms(level.platforms, offset, i + 1));
  const echoHazards = offsets.flatMap((offset) => cloneHazards(level.hazards, offset));
  const extraHazards = offsets.flatMap((offset, i) => addGroundSpikes(clonePlatforms(level.platforms, offset, i + 1), offset, level.id, i + 1));
  const echoPickups = offsets.flatMap((offset, i) => clonePickups(level.pickups, offset, level.id, i + 1));
  const echoDecor = offsets.flatMap((offset, i) => cloneDecor(level.decor, offset, level.id, i + 1));
  const echoTriggers = offsets.flatMap((offset, i) => echoTriggersFor(level, offset, i + 1));

  return {
    ...level,
    width: section * 4,
    exit: { ...level.exit, x: section * 4 - 150 },
    platforms: [...level.platforms, ...echoPlatforms],
    hazards: [...level.hazards, ...echoHazards, ...extraHazards],
    pickups: [...level.pickups, ...echoPickups],
    decor: [...level.decor, ...echoDecor],
    triggers: [...level.triggers, ...echoTriggers],
    checkpoints: [
      ...level.checkpoints,
      ...offsets.flatMap((offset) => level.checkpoints.map((c) => ({ x: c.x + offset, y: c.y }))),
    ],
  };
});

function echoTriggersFor(level: LevelDef, offset: number, pass: number): Trigger[] {
  return echoTriggers(level, offset, pass);
}

export function getExpandedLevel(id: number): LevelDef {
  return EXPANDED_LEVELS.find((l) => l.id === id) ?? EXPANDED_LEVELS[0];
}
