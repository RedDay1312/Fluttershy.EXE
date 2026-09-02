import { LEVELS, type Decor, type Hazard, type LevelDef, type Pickup, type Plat, type Trigger } from "./levels";

function cloneDecor(items: Decor[], offset: number, pass: number): Decor[] { return items.map((d) => ({ ...d, x: d.x + offset, alpha: d.alpha == null ? undefined : Math.max(0.12, d.alpha * (pass === 1 ? 0.9 : pass === 2 ? 0.68 : 0.48)), flip: pass >= 2 ? !d.flip : d.flip })); }
function clonePlatforms(items: Plat[], offset: number, pass: number): Plat[] { return items.map((p) => ({ ...p, x: p.x + offset, move: p.move ? { ...p.move, period: Math.max(1100, p.move.period * (pass === 1 ? 1 : pass === 2 ? 0.88 : 0.76)) } : undefined })); }
function cloneHazards(items: Hazard[], offset: number): Hazard[] { return items.map((h) => ({ ...h, x: h.x + offset })); }
function clonePickups(items: Pickup[], offset: number, level: number, pass: number): Pickup[] { return items.filter((p) => p.kind !== "note").map((p, i) => ({ ...p, x: p.x + offset, id: `${p.id}-echo-${level}-${pass}-${i}` })); }

const SOURCE_NOTES = LEVELS.flatMap((level) => level.pickups.filter((p) => p.kind === "note")).slice(0, 12);
const CURATED_NOTE_IDS = new Map(SOURCE_NOTES.map((p, index) => [p.id, `lore-${String(index + 1).padStart(2, "0")}`]));
function curatePickups(items: Pickup[]): Pickup[] { return items.filter((p) => p.kind !== "note" || CURATED_NOTE_IDS.has(p.id)).map((p) => p.kind === "note" ? { ...p, id: CURATED_NOTE_IDS.get(p.id)! } : p); }

function equestriaDetails(level: LevelDef, offset: number, pass: number): Decor[] {
  const out: Decor[] = [];
  const add = (x: number, y: number, sprite: string, scale: number, depth = 6, alpha = 1, extra: Partial<Decor> = {}) => out.push({ x: offset + x, y, sprite, scale, depth, alpha, ...extra });
  const w = level.width;

  if (level.id === 1) {
    for (let x = 360; x < w - 300; x += 980) {
      add(x, 628, "cottage", pass === 0 ? 0.42 : 0.34, 4, pass === 0 ? 0.96 : 0.72);
      add(x + 105, 606, "flower", 0.42, 7, 0.9, { sway: true });
      add(x + 170, 595, "flower", 0.32, 7, 0.78, { sway: true });
      add(x + 250, 605, "butterflies", 0.34, 8, Math.max(0.3, 0.92 - pass * 0.2), { sway: true });
      add(x + 355, 600, "cutie", 0.2, 8, Math.max(0.22, 0.72 - pass * 0.16));
    }
  } else if (level.id === 2) {
    for (let x = 240; x < w - 240; x += 830) {
      add(x, 628, "cottage", 0.34, 4, Math.max(0.32, 0.82 - pass * 0.14));
      add(x + 150, 611, "flower", 0.38, 7, Math.max(0.3, 0.76 - pass * 0.12), { sway: true });
      add(x + 250, 590, "butterflies", 0.3, 8, Math.max(0.22, 0.72 - pass * 0.16), { sway: true });
      add(x + 360, 604, "cutie", 0.22, 8, Math.max(0.18, 0.58 - pass * 0.12));
    }
  } else if (level.id === 3) {
    for (let x = 380; x < w - 320; x += 920) {
      add(x, 628, "cottage", 0.34, 4, 0.42, { sway: true });
      add(x + 100, 603, "flower", 0.4, 7, 0.42, { sway: true });
      add(x + 205, 592, "butterflies", 0.3, 8, 0.2, { sway: true });
      add(x + 310, 602, "cutie", 0.24, 8, 0.34);
    }
  } else if (level.id >= 4) {
    for (let x = 420; x < w - 300; x += 1040) {
      add(x, 610, "cutie", 0.28, 8, level.id >= 6 ? 0.18 : 0.28);
      add(x + 150, 616, "flower", 0.36, 7, level.id >= 6 ? 0.15 : 0.24, { sway: true });
      if (pass === 0) add(x + 270, 628, "cottage", 0.28, 4, 0.2);
    }
  }

  const markStep = level.id <= 2 ? 610 : 820;
  for (let x = 520; x < w - 180; x += markStep) {
    const alpha = level.id <= 2 ? Math.max(0.32, 0.72 - pass * 0.16) : Math.max(0.12, 0.42 - pass * 0.1);
    add(x, level.id <= 2 ? 520 : 570, "cutie", level.id <= 2 ? 0.2 : 0.16, 8, alpha);
  }
  return out;
}

function atmosphericDecor(level: LevelDef, offset: number, pass: number): Decor[] {
  const w = level.width, out: Decor[] = [];
  const corrupted = level.id >= 3 || pass >= 2, severe = level.id >= 5 || pass >= 3;
  const add = (x: number, y: number, sprite: string, scale: number, depth = 7, alpha = 1, extra: Partial<Decor> = {}) => out.push({ x: offset + x, y, sprite, scale, depth, alpha, ...extra });
  out.push(...equestriaDetails(level, offset, pass));
  for (let x = 280; x < w - 180; x += 760) {
    if (level.id === 1 && pass === 1) add(x, 628, x % 1520 < 760 ? "cottage" : "sign", x % 1520 < 760 ? 0.34 : 0.75, 5, 0.82);
    else if (level.id === 2) { add(x, 628, x % 1520 < 760 ? "rock" : "mushroom", x % 1520 < 760 ? 0.72 : 0.58, 6, 0.7); if (pass >= 2) add(x + 130, 548, "eyes", 0.48, 9, 0.3, { follow: true, sway: true }); }
    else if (level.id === 3) { add(x, 628, x % 1520 < 760 ? "rock" : "mushroom", x % 1520 < 760 ? 0.75 : 0.62, 6, 0.72); add(x + 170, 560, "eyes", 0.48, 9, 0.38, { follow: true, sway: true }); }
    else if (level.id === 4) add(x, 600, "eyes", 0.58, 9, 0.48, { follow: true, sway: true });
    else if (corrupted) add(x, 600, severe ? "fs-distorted" : "eyes", severe ? 0.52 : 0.7, 6, severe ? 0.16 : 0.5, severe ? { sway: true } : { follow: true, sway: true });
  }
  const clutterStep = level.id <= 2 ? 315 : level.id === 3 ? 260 : 390;
  for (let i = 0, x = 145; x < w - 120; i++, x += clutterStep) {
    const y = 625 + ((i * 37 + pass * 19) % 13);
    if (level.id === 1) { if (i % 3 === 0) add(x, y, "rock", 0.42 + (i % 2) * 0.12, 6, 0.72); if (i % 4 === 1) add(x + 48, y, "mushroom", 0.48, 7, 0.72, { sway: true }); if (pass >= 3 && i % 7 === 2) add(x + 80, 520, "eyes", 0.38, 9, 0.24, { follow: true, sway: true }); }
    else if (level.id === 2) { if (i % 3 === 0) add(x, y, "rock", 0.5, 6, 0.55); if (i % 4 === 2) add(x + 28, y - 8, "eyes", 0.42, 9, 0.28, { follow: true, sway: true }); }
    else if (level.id === 3) { if (i % 3 === 0) add(x, y, "rock", 0.52, 6, 0.62); if (i % 4 === 0) add(x + 35, y, "mushroom", 0.44, 7, 0.58); if (i % 5 === 2) add(x + 75, 585, "eyes", 0.46, 9, 0.34, { follow: true, sway: true }); if (i % 7 === 4) add(x + 110, 530, "skull", 0.28, 7, 0.72); }
    else { if (i % 2 === 0) add(x, y - 20, "eyes", severe ? 0.5 : 0.42, 9, severe ? 0.42 : 0.26, { follow: true, sway: true }); if (i % 5 === 1) add(x + 70, 610, "poster", 0.36, 6, severe ? 0.3 : 0.46, { flip: i % 2 === 0 }); }
  }
  if (level.id >= 3) { const hanging = ["hang-orange", "hang-pink", "hang-purple", "hang-yellow"], count = level.id === 3 ? 2 : level.id === 4 ? 3 : 4; for (let i = 0; i < count; i++) { const x = 560 + ((i * 977 + level.id * 313 + pass * 181) % Math.max(600, w - 900)); const y = 170 + ((i * 67 + pass * 29) % 120); const sprite = hanging[(i + level.id + pass) % hanging.length]; const alpha = level.id === 3 ? 0.48 : level.id === 4 ? 0.62 : Math.min(0.78, 0.48 + pass * 0.08); add(x, y, sprite, level.id >= 5 ? 0.72 : 0.62, 4, alpha, { sway: true }); } }
  if (level.id >= 3) { const skullCount = level.id === 3 ? 2 : level.id === 4 ? 4 : 6; for (let i = 0; i < skullCount; i++) { const x = 390 + ((i * 811 + pass * 143) % Math.max(500, w - 700)); add(x, 608, "skull", 0.25 + (i % 2) * 0.06, 7, level.id === 3 ? 0.62 : 0.78); } }
  const watcherCount = level.id <= 2 ? 3 + pass : 5 + pass * 2;
  for (let i = 0; i < watcherCount; i++) { const x = 420 + ((i * 733 + level.id * 211 + pass * 127) % Math.max(500, w - 650)); const y = 220 + ((i * 91 + level.id * 43) % 260); const alpha = Math.min(0.58, 0.18 + level.id * 0.035 + pass * 0.045); add(x, y, "eyes", 0.38 + (i % 3) * 0.08, 10, alpha, { follow: true, sway: true }); }
  return out;
}

function makeEchoTriggers(level: LevelDef, offset: number, pass: number): Trigger[] { const end = offset + level.width; return [
  { x: offset + 360, y: 0, w: 90, h: level.height, event: "whisper", once: true, key: pass === 1 ? "whisper.1" : pass === 2 ? "whisper.2" : "whisper.4" },
  { x: offset + Math.floor(level.width * 0.28), y: 0, w: 90, h: level.height, event: "shake", once: true },
  { x: offset + Math.floor(level.width * 0.52), y: 0, w: 90, h: level.height, event: pass >= 3 ? "black" : "glitch", once: true },
  { x: offset + Math.floor(level.width * 0.74), y: 0, w: 90, h: level.height, event: pass >= 2 ? "stare" : "shake", once: true, key: "Флаттершай: Я уже проходила это место... почему оно снова здесь?" },
  { x: end - 420, y: 0, w: 110, h: level.height, event: pass >= 3 ? "distort" : "glitch", once: true },
]; }
function addGroundSpikes(platforms: Plat[], offset: number, level: number, pass: number): Hazard[] { const hazards: Hazard[] = [], sourceWidth = LEVELS[level - 1]?.width ?? 0; if (!sourceWidth) return hazards; for (const platform of platforms) { if (platform.h < 100 || platform.w < 520) continue; const start = Math.max(platform.x + 230, offset + 260), end = Math.min(platform.x + platform.w - 220, offset + sourceWidth - 260); const spacing = pass === 1 ? (level >= 5 ? 560 : 760) : pass === 2 ? (level >= 5 ? 470 : 650) : (level >= 5 ? 390 : 560); for (let x = start; x < end; x += spacing) hazards.push({ x, y: platform.y - 45, w: 56, h: 45, kind: "spikes" }); } return hazards; }
function findCheckpointSupport(c: { x: number; y: number }, platforms: Plat[]) { return platforms.filter((p) => p.w >= 70 && c.x >= p.x + 24 && c.x <= p.x + p.w - 24).map((p) => ({ p, distance: Math.abs((p.y - 104) - c.y) })).filter(({ distance }) => distance <= 150).sort((a, b) => a.distance - b.distance)[0]?.p; }
function sanitizeCheckpoints(checkpoints: LevelDef["checkpoints"], platforms: Plat[]): LevelDef["checkpoints"] { const result: LevelDef["checkpoints"] = []; const seen = new Set<string>(); for (const c of checkpoints) { if (!Number.isFinite(c.x) || !Number.isFinite(c.y)) continue; const support = findCheckpointSupport(c, platforms); if (!support) continue; const x = Math.round(Math.max(support.x + 28, Math.min(support.x + support.w - 28, c.x))); const y = support.y - 104; const key = `${x}:${y}`; if (seen.has(key)) continue; seen.add(key); result.push({ x, y }); } return result; }

export const EXPANDED_LEVELS: LevelDef[] = LEVELS.map((level) => {
  const section = level.width, offsets = [section, section * 2, section * 3];
  const echoPlatforms = offsets.flatMap((offset, index) => clonePlatforms(level.platforms, offset, index + 1));
  const allPlatforms = [...level.platforms, ...echoPlatforms];
  const echoHazards = offsets.flatMap((offset) => cloneHazards(level.hazards, offset));
  const extraHazards = offsets.flatMap((offset, index) => addGroundSpikes(clonePlatforms(level.platforms, offset, index + 1), offset, level.id, index + 1));
  const echoPickups = offsets.flatMap((offset, index) => clonePickups(level.pickups, offset, level.id, index + 1));
  const echoDecor = offsets.flatMap((offset, index) => [...cloneDecor(level.decor, offset, index + 1), ...atmosphericDecor(level, offset, index + 1)]);
  const echoEvents = offsets.flatMap((offset, index) => makeEchoTriggers(level, offset, index + 1));
  const checkpoints = sanitizeCheckpoints([...level.checkpoints, ...offsets.flatMap((offset) => level.checkpoints.map((c) => ({ x: c.x + offset, y: c.y })))], allPlatforms);
  return { ...level, width: section * 4, exit: { ...level.exit, x: section * 4 - 150 }, platforms: allPlatforms, hazards: [...level.hazards, ...echoHazards, ...extraHazards], pickups: [...curatePickups(level.pickups), ...echoPickups], decor: [...level.decor, ...atmosphericDecor(level, 0, 0), ...echoDecor], triggers: [...level.triggers, ...echoEvents], checkpoints };
});
export function getExpandedLevel(id: number): LevelDef { return EXPANDED_LEVELS.find((level) => level.id === id) ?? EXPANDED_LEVELS[0]; }
