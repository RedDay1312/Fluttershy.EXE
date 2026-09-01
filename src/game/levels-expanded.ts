import { LEVELS, type Decor, type Hazard, type LevelDef, type Pickup, type Plat, type Trigger } from "./levels";

/**
 * Extends every campaign level with a second, altered pass through the area.
 * The original first half is preserved; the player must travel through an
 * additional section before reaching the exit. This keeps the authored level
 * data intact while making progression substantially longer without making
 * jumps arbitrarily wider.
 */
function cloneDecor(items: Decor[], offset: number, level: number): Decor[] {
  return items.map((d) => ({
    ...d,
    x: d.x + offset,
    // The second pass is progressively less visible as the corruption grows.
    alpha: d.alpha == null ? undefined : Math.max(0.18, d.alpha * (level >= 5 ? 0.72 : 0.9)),
  }));
}

function clonePlatforms(items: Plat[], offset: number): Plat[] {
  return items.map((p) => ({
    ...p,
    x: p.x + offset,
    move: p.move ? { ...p.move } : undefined,
  }));
}

function cloneHazards(items: Hazard[], offset: number): Hazard[] {
  return items.map((h) => ({ ...h, x: h.x + offset }));
}

function clonePickups(items: Pickup[], offset: number, level: number): Pickup[] {
  return items.map((p, i) => ({
    ...p,
    x: p.x + offset,
    id: `${p.id}-echo-${level}-${i}`,
  }));
}

function echoTriggers(level: LevelDef, offset: number): Trigger[] {
  const x = offset;
  const end = offset + level.width;
  const late = Math.max(x + 300, end - 360);

  const triggers: Trigger[] = [
    { x: x + 420, y: 0, w: 90, h: level.height, event: "whisper", once: true, key: "whisper.1" },
    { x: x + Math.floor(level.width * 0.42), y: 0, w: 90, h: level.height, event: "shake", once: true },
  ];

  if (level.id >= 3) {
    triggers.push({ x: x + Math.floor(level.width * 0.68), y: 0, w: 90, h: level.height, event: "glitch", once: true });
  }
  if (level.id >= 5) {
    triggers.push({ x: x + Math.floor(level.width * 0.82), y: 0, w: 90, h: level.height, event: "distort", once: true });
  }

  triggers.push({ x: late, y: 0, w: 120, h: level.height, event: "shake", once: true });
  return triggers;
}

function addGroundSpikes(platforms: Plat[], offset: number, level: number): Hazard[] {
  const hazards: Hazard[] = [];
  for (const p of platforms) {
    if (p.h < 100 || p.w < 520) continue;
    const start = Math.max(p.x + 220, offset + 260);
    const end = Math.min(p.x + p.w - 220, offset + LEVELS[level - 1].width - 260);
    const spacing = level >= 5 ? 520 : 700;
    for (let x = start; x < end; x += spacing) {
      hazards.push({ x, y: p.y - 45, w: 56, h: 45, kind: "spikes" });
    }
  }
  return hazards;
}

export const EXPANDED_LEVELS: LevelDef[] = LEVELS.map((level) => {
  const offset = level.width;
  const width = level.width * 2;
  const echoPlatforms = clonePlatforms(level.platforms, offset);
  const echoHazards = cloneHazards(level.hazards, offset);
  const echoPickups = clonePickups(level.pickups, offset, level.id);

  return {
    ...level,
    width,
    exit: { ...level.exit, x: width - 150 },
    platforms: [...level.platforms, ...echoPlatforms],
    hazards: [...level.hazards, ...echoHazards, ...addGroundSpikes(echoPlatforms, offset, level.id)],
    pickups: [...level.pickups, ...echoPickups],
    decor: [...level.decor, ...cloneDecor(level.decor, offset, level.id)],
    triggers: [...level.triggers, ...echoTriggers(level, offset)],
    checkpoints: [
      ...level.checkpoints,
      ...level.checkpoints.map((c) => ({ x: c.x + offset, y: c.y })),
    ],
  };
});

export function getExpandedLevel(id: number): LevelDef {
  return EXPANDED_LEVELS.find((l) => l.id === id) ?? EXPANDED_LEVELS[0];
}
