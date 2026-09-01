export type Plat = { x: number; y: number; w: number; h: number; tex: string; oneWay?: boolean; move?: { dx: number; dy: number; period: number } };
export type Hazard = { x: number; y: number; w: number; h: number; kind: "spikes" | "pit" | "puddle" };
export type Pickup = { x: number; y: number; kind: "butterfly" | "note" | "flower" | "letter" | "gem" | "mark"; id: string };
export type Decor = { x: number; y: number; sprite: string; scale?: number; flip?: boolean; sway?: boolean; depth?: number; alpha?: number; follow?: boolean };
export type Npc = { x: number; y: number; sprite: string; nameKey: string; lineKey: string; scale?: number };
export type Trigger = { x: number; y: number; w: number; h: number; event: "dialogue" | "look" | "red" | "bsod" | "notepad" | "windows" | "cursor" | "desktop-pony" | "gravity" | "distort" | "ending" | "freeze" | "black" | "glitch" | "whisper" | "shake" | "angel-gone" | "stare"; key?: string; once?: boolean };
export type LevelDef = { id: number; width: number; height: number; sky: string; far: string; fog?: string; plat: string; spawn: { x: number; y: number }; exit: { x: number; y: number; w: number; h: number }; platforms: Plat[]; hazards: Hazard[]; pickups: Pickup[]; decor: Decor[]; npcs: Npc[]; triggers: Trigger[]; checkpoints: { x: number; y: number }[]; intro: string[]; gravity?: number; angel?: boolean };

const H = 720;
const G = 628;
const TH = 40;
const ground = (x: number, w: number, tex: string): Plat => ({ x, y: G, w, h: H - G + 8, tex });
const plat = (x: number, y: number, w: number, tex: string): Plat => ({ x, y, w, h: TH, tex, oneWay: true });
const mover = (x: number, y: number, w: number, tex: string, dx: number, dy: number, period: number): Plat => ({ x, y, w, h: TH, tex, oneWay: true, move: { dx, dy, period } });
const grove = (x: number, alpha = 1): Decor[] => [
  { x, y: G, sprite: "tree-3", scale: 0.58, depth: 2, alpha },
  { x: x + 85, y: G, sprite: "tree-2", scale: 0.42, flip: true, depth: 1, alpha: alpha * 0.8 },
  { x: x + 35, y: G, sprite: "bush", scale: 0.5, depth: 6, alpha },
];
const grass = (a: number, b: number, step = 90, alpha = 1): Decor[] => {
  const out: Decor[] = [];
  for (let x = a; x < b; x += step) out.push({ x, y: G, sprite: "grass", scale: 0.85 + ((x * 7) % 25) / 100, depth: 7, alpha });
  return out;
};
const eyes = (x: number, y = 520, alpha = 0.65): Decor => ({ x, y, sprite: "eyes", follow: true, sway: true, depth: 8, scale: 0.7, alpha });

// The story is deliberately paced: normal forest -> uneasy forest -> corruption -> reality failure -> final distortion.
// No companion NPCs, angel, Discord cameos or random desktop gags are used in the level flow.
export const LEVELS: LevelDef[] = [
  {
    id: 1, width: 4200, height: H, sky: "/maps/forest-sky.jpg", far: "/maps/forest-far.jpg", plat: "grass",
    spawn: { x: 180, y: 500 }, exit: { x: 4050, y: G - 168, w: 120, h: 168 },
    intro: ["d.intro.1", "d.intro.2", "d.intro.3"], npcs: [],
    platforms: [ground(0, 900, "grass"), plat(980, 520, 180, "grass"), plat(1240, 420, 180, "wood"), plat(1500, 520, 200, "grass"), ground(1740, 760, "grass"), plat(1880, 480, 180, "grass"), plat(2140, 380, 180, "wood"), plat(2400, 500, 190, "grass"), ground(2620, 760, "grass"), plat(2800, 480, 190, "wood"), plat(3070, 390, 180, "grass"), plat(3330, 500, 190, "wood"), ground(3550, 650, "grass")],
    hazards: [{ x: 900, y: 680, w: 80, h: 50, kind: "pit" }, { x: 1700, y: 680, w: 40, h: 50, kind: "pit" }, { x: 2580, y: 680, w: 40, h: 50, kind: "pit" }, { x: 3510, y: 680, w: 40, h: 50, kind: "pit" }],
    pickups: [{ x: 420, y: 560, kind: "note", id: "1" }, { x: 1060, y: 470, kind: "butterfly", id: "b1" }, { x: 1320, y: 370, kind: "flower", id: "f1" }, { x: 2020, y: 430, kind: "butterfly", id: "b2" }, { x: 2200, y: 330, kind: "note", id: "2" }, { x: 2910, y: 430, kind: "butterfly", id: "b3" }, { x: 3410, y: 450, kind: "note", id: "3" }],
    decor: [{ x: 80, y: G, sprite: "cottage", scale: 0.78, depth: 3 }, { x: 500, y: G, sprite: "sign", scale: 0.65, depth: 8 }, ...grove(650), ...grove(1580), ...grove(2360), ...grove(3200), ...grass(0, 4100)],
    checkpoints: [{ x: 180, y: 500 }, { x: 1740, y: 500 }, { x: 2620, y: 500 }, { x: 3550, y: 500 }],
    triggers: [{ x: 500, y: 0, w: 70, h: H, event: "dialogue", key: "d.l1.sign", once: true }, { x: 2050, y: 0, w: 70, h: H, event: "dialogue", key: "d.l1.mid", once: true }, { x: 3850, y: 0, w: 70, h: H, event: "dialogue", key: "d.l1.end", once: true }]
  },
  {
    id: 2, width: 4400, height: H, sky: "/maps/fog-sky.jpg", far: "/maps/fog-far.jpg", fog: "/maps/fog-overlay.png", plat: "grass",
    spawn: { x: 180, y: 500 }, exit: { x: 4250, y: G - 168, w: 120, h: 168 }, intro: ["d.l2.start"], npcs: [],
    platforms: [ground(0, 760, "grass"), plat(820, 520, 180, "wood"), plat(1080, 430, 170, "grass"), ground(1320, 620, "grass"), plat(1500, 500, 180, "grass"), plat(1760, 400, 180, "wood"), plat(2020, 500, 180, "grass"), ground(2220, 680, "grass"), plat(2420, 470, 180, "wood"), plat(2680, 370, 170, "grass"), ground(2920, 650, "grass"), plat(3160, 500, 190, "wood"), plat(3430, 400, 180, "grass"), ground(3650, 750, "grass")],
    hazards: [{ x: 760, y: 680, w: 60, h: 50, kind: "pit" }, { x: 1260, y: 680, w: 60, h: 50, kind: "pit" }, { x: 2160, y: 680, w: 60, h: 50, kind: "pit" }, { x: 2860, y: 680, w: 60, h: 50, kind: "pit" }, { x: 3590, y: 680, w: 60, h: 50, kind: "pit" }],
    pickups: [{ x: 900, y: 470, kind: "note", id: "4" }, { x: 1150, y: 380, kind: "butterfly", id: "b4" }, { x: 1820, y: 350, kind: "note", id: "5" }, { x: 2730, y: 320, kind: "flower", id: "f2" }, { x: 3250, y: 450, kind: "note", id: "6" }, { x: 3920, y: 560, kind: "butterfly", id: "b5" }],
    decor: [...grove(250), ...grove(1450), ...grove(2300, 0.75), ...grove(3150, 0.65), ...grove(3850, 0.55), ...grass(0, 4250, 95, 0.85), eyes(720), eyes(2350, 520, 0.55), eyes(3350, 500, 0.45)],
    checkpoints: [{ x: 180, y: 500 }, { x: 1320, y: 500 }, { x: 2220, y: 500 }, { x: 2920, y: 500 }, { x: 3650, y: 500 }],
    triggers: [{ x: 1200, y: 0, w: 60, h: H, event: "dialogue", key: "d.l2.look", once: true }, { x: 2500, y: 0, w: 60, h: H, event: "look", key: "d.l2.look", once: true }, { x: 3500, y: 0, w: 60, h: H, event: "whisper", key: "whisper.1", once: true }, { x: 4100, y: 0, w: 70, h: H, event: "dialogue", key: "d.l2.end", once: true }]
  },
  {
    id: 3, width: 4600, height: H, sky: "/maps/blood-sky.jpg", far: "/maps/blood-far.jpg", fog: "/maps/blood-fog.png", plat: "blood",
    spawn: { x: 180, y: 500 }, exit: { x: 4450, y: G - 168, w: 120, h: 168 }, intro: ["d.l3.start"], npcs: [],
    platforms: [ground(0, 700, "blood"), plat(780, 520, 170, "blood"), plat(1020, 430, 160, "wood"), ground(1240, 600, "blood"), plat(1460, 500, 180, "blood"), plat(1720, 400, 170, "wood"), ground(1950, 620, "blood"), plat(2180, 490, 180, "blood"), plat(2440, 380, 170, "wood"), ground(2660, 650, "blood"), plat(2910, 500, 190, "blood"), plat(3180, 390, 180, "wood"), ground(3410, 650, "blood"), plat(3650, 500, 180, "blood"), plat(3920, 400, 170, "wood"), ground(4150, 400, "blood")],
    hazards: [{ x: 700, y: 680, w: 80, h: 50, kind: "pit" }, { x: 1180, y: 680, w: 60, h: 50, kind: "pit" }, { x: 1890, y: 680, w: 60, h: 50, kind: "pit" }, { x: 2600, y: 680, w: 60, h: 50, kind: "pit" }, { x: 3350, y: 680, w: 60, h: 50, kind: "pit" }, { x: 4090, y: 680, w: 60, h: 50, kind: "pit" }, { x: 1510, y: G - 20, w: 90, h: 28, kind: "spikes" }, { x: 3020, y: G - 20, w: 90, h: 28, kind: "spikes" }, { x: 3820, y: G - 20, w: 90, h: 28, kind: "puddle" }],
    pickups: [{ x: 460, y: 560, kind: "note", id: "7" }, { x: 1070, y: 380, kind: "note", id: "8" }, { x: 1800, y: 350, kind: "note", id: "9" }, { x: 2500, y: 330, kind: "flower", id: "f3" }, { x: 3250, y: 340, kind: "note", id: "10" }, { x: 3980, y: 350, kind: "note", id: "11" }],
    decor: [...grove(300, 0.8), ...grove(1360, 0.65), ...grove(2050, 0.55), ...grove(2780, 0.45), ...grove(3500, 0.35), ...grass(0, 4500, 110, 0.45), eyes(900, 500, 0.6), eyes(2800, 500, 0.55), eyes(3750, 500, 0.5)],
    checkpoints: [{ x: 180, y: 500 }, { x: 1240, y: 500 }, { x: 1950, y: 500 }, { x: 2660, y: 500 }, { x: 3410, y: 500 }, { x: 4150, y: 500 }],
    triggers: [{ x: 650, y: 0, w: 50, h: H, event: "dialogue", key: "d.l3.poster", once: true }, { x: 1900, y: 0, w: 50, h: H, event: "red", key: "red.1", once: true }, { x: 2700, y: 0, w: 50, h: H, event: "dialogue", key: "d.l3.whisper", once: true }, { x: 3550, y: 0, w: 50, h: H, event: "red", key: "red.2", once: true }, { x: 4250, y: 0, w: 60, h: H, event: "red", key: "red.6", once: true }]
  },
  {
    id: 4, width: 4700, height: H, sky: "/maps/void-sky.jpg", far: "/maps/void-far.jpg", plat: "glitch",
    spawn: { x: 180, y: 500 }, exit: { x: 4550, y: G - 168, w: 120, h: 168 }, intro: ["d.l4.start"], npcs: [],
    platforms: [ground(0, 760, "glitch"), plat(850, 520, 180, "glitch"), plat(1100, 430, 170, "void"), ground(1320, 650, "glitch"), plat(1530, 500, 190, "void"), plat(1800, 400, 180, "glitch"), ground(2020, 620, "glitch"), plat(2250, 490, 190, "void"), mover(2520, 500, 160, "glitch", 0, -130, 2600), plat(2800, 360, 180, "void"), ground(3020, 680, "glitch"), plat(3260, 490, 190, "void"), plat(3530, 380, 180, "glitch"), ground(3750, 600, "glitch""), plat(3970, 480, 180, "void"), plat(4230, 370, 180, "glitch"), ground(4450, 250, "glitch")],
    hazards: [{ x: 760, y: 680, w: 90, h: 50, kind: "pit" }, { x: 1270, y: 680, w: 50, h: 50, kind: "pit" }, { x: 1950, y: 680, w: 70, h: 50, kind: "pit" }, { x: 2950, y: 680, w: 70, h: 50, kind: "pit" }, { x: 3680, y: 680, w: 70, h: 50, kind: "pit" }, { x: 4380, y: 680, w: 70, h: 50, kind: "pit" }],
    pickups: [{ x: 1160, y: 380, kind: "note", id: "12" }, { x: 1850, y: 350, kind: "note", id: "13" }, { x: 2840, y: 310, kind: "note", id: "14" }, { x: 4040, y: 430, kind: "note", id: "15" }],
    decor: [eyes(980, 500, 0.55), eyes(2150, 500, 0.5), eyes(3180, 480, 0.45), eyes(4050, 470, 0.4)],
    checkpoints: [{ x: 180, y: 500 }, { x: 1320, y: 500 }, { x: 2020, y: 500 }, { x: 3020, y: 500 }, { x: 3750, y: 500 }],
    triggers: [{ x: 1050, y: 0, w: 50, h: H, event: "dialogue", key: "d.l4.comp", once: true }, { x: 2050, y: 0, w: 50, h: H, event: "glitch", once: true }, { x: 3050, y: 0, w: 50, h: H, event: "red", key: "red.3", once: true }, { x: 4100, y: 0, w: 50, h: H, event: "whisper", key: "whisper.2", once: true }]
  },
  {
    id: 5, width: 4700, height: H, sky: "/maps/desktop-corrupt.jpg", far: "/maps/forest-far.jpg", plat: "stone",
    spawn: { x: 180, y: 500 }, exit: { x: 4550, y: G - 168, w: 120, h: 168 }, intro: ["d.l5.1", "d.l5.2"], npcs: [],
    platforms: [ground(0, 800, "stone"), plat(880, 520, 180, "wood"), plat(1130, 430, 170, "stone"), ground(1370, 650, "stone"), plat(1590, 500, 190, "wood"), plat(1860, 390, 180, "stone"), ground(2080, 650, "stone"), plat(2300, 490, 190, "wood"), plat(2580, 370, 180, "stone"), ground(2800, 700, "stone"), plat(3050, 490, 190, "wood"), mover(3330, 500, 170, "stone", 140, 0, 2800), plat(3650, 390, 180, "stone"), ground(3880, 700, "stone")],
    hazards: [{ x: 800, y: 680, w: 80, h: 50, kind: "pit" }, { x: 1300, y: 680, w: 70, h: 50, kind: "pit" }, { x: 2010, y: 680, w: 70, h: 50, kind: "pit" }, { x: 2720, y: 680, w: 80, h: 50, kind: "pit" }, { x: 3800, y: 680, w: 80, h: 50, kind: "pit" }],
    pickups: [{ x: 520, y: 560, kind: "note", id: "16" }, { x: 1200, y: 380, kind: "note", id: "17" }, { x: 1940, y: 340, kind: "note", id: "18" }, { x: 2660, y: 320, kind: "note", id: "19" }, { x: 3130, y: 450, kind: "note", id: "20" }, { x: 4050, y: 560, kind: "note", id: "21" }],
    decor: [eyes(1000, 500, 0.5), eyes(2150, 500, 0.45), eyes(2920, 500, 0.4), eyes(3950, 500, 0.35)],
    checkpoints: [{ x: 180, y: 500 }, { x: 1370, y: 500 }, { x: 2080, y: 500 }, { x: 2800, y: 500 }, { x: 3880, y: 500 }],
    triggers: [{ x: 1450, y: 0, w: 50, h: H, event: "windows", once: true }, { x: 2200, y: 0, w: 50, h: H, event: "stare", key: "d.l5.stare", once: true }, { x: 3000, y: 0, w: 50, h: H, event: "glitch", once: true }, { x: 3900, y: 0, w: 50, h: H, event: "whisper", key: "whisper.2", once: true }]
  },
  {
    id: 6, width: 4800, height: H, sky: "/maps/glitch-far.jpg", far: "/maps/glitch-far.jpg", plat: "void",
    spawn: { x: 180, y: 500 }, exit: { x: 4650, y: G - 168, w: 120, h: 168 }, intro: ["d.l6.1", "d.l6.2"], gravity: 1, npcs: [],
    platforms: [ground(0, 720, "void"), plat(800, 510, 170, "glitch"), plat(1050, 410, 170, "void"), ground(1290, 620, "void"), plat(1500, 500, 180, "glitch"), plat(1770, 390, 170, "void"), ground(1990, 650, "void"), plat(2220, 480, 180, "glitch"), mover(2480, 500, 170, "glitch", 0, -150, 2500), plat(2780, 350, 180, "void"), ground(3000, 680, "void"), plat(3230, 480, 190, "glitch"), plat(3510, 360, 180, "void"), ground(3730, 650, "void"), plat(3980, 480, 180, "glitch"), plat(4250, 350, 180, "void"), ground(4470, 250, "void")],
    hazards: [{ x: 720, y: 680, w: 80, h: 50, kind: "pit" }, { x: 1220, y: 680, w: 70, h: 50, kind: "pit" }, { x: 1910, y: 680, w: 80, h: 50, kind: "pit" }, { x: 2920, y: 680, w: 80, h: 50, kind: "pit" }, { x: 3650, y: 680, w: 80, h: 50, kind: "pit" }, { x: 4390, y: 680, w: 80, h: 50, kind: "pit" }],
    pickups: [{ x: 1120, y: 360, kind: "gem", id: "22" }, { x: 1810, y: 340, kind: "note", id: "23" }, { x: 2860, y: 300, kind: "gem", id: "24" }, { x: 4070, y: 430, kind: "mark", id: "m6" }],
    decor: [eyes(950, 500, 0.45), eyes(2100, 500, 0.4), eyes(3100, 470, 0.35), eyes(4000, 450, 0.3)],
    checkpoints: [{ x: 180, y: 500 }, { x: 1290, y: 500 }, { x: 1990, y: 500 }, { x: 3000, y: 500 }, { x: 3730, y: 500 }],
    triggers: [{ x: 1450, y: 0, w: 50, h: H, event: "distort", once: true }, { x: 2200, y: 0, w: 50, h: H, event: "whisper", key: "red.4", once: true }, { x: 3250, y: 0, w: 50, h: H, event: "look", key: "red.4", once: true }, { x: 4000, y: 0, w: 50, h: H, event: "black", key: "black.1", once: true }, { x: 4400, y: 0, w: 50, h: H, event: "red", key: "red.5", once: true }]
  },
  {
    id: 7, width: 3000, height: H, sky: "/maps/finale-sky.jpg", far: "/maps/finale-sky.jpg", plat: "void",
    spawn: { x: 180, y: 500 }, exit: { x: 2680, y: G - 168, w: 120, h: 168 }, intro: ["d.fin.1", "d.fin.2", "d.fin.3", "d.fin.4"], npcs: [],
    platforms: [ground(0, 900, "void"), plat(980, 510, 190, "glitch"), plat(1260, 400, 180, "void"), plat(1530, 290, 190, "glitch"), ground(1780, 1100, "void")],
    hazards: [{ x: 900, y: 680, w: 80, h: 50, kind: "pit" }, { x: 1700, y: 680, w: 80, h: 50, kind: "pit" }],
    pickups: [], decor: [eyes(700, 430, 0.3), eyes(2050, 420, 0.25), eyes(2400, 380, 0.2)],
    checkpoints: [{ x: 180, y: 500 }, { x: 1780, y: 500 }],
    triggers: [{ x: 1850, y: 0, w: 60, h: H, event: "stare", key: "d.fin.look", once: true }, { x: 2500, y: 0, w: 80, h: H, event: "ending", once: true }]
  }
];

export function getLevel(id: number): LevelDef {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
