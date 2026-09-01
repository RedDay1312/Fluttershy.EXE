export type Plat = {
  x: number;
  y: number;
  w: number;
  h: number;
  tex: string;
  oneWay?: boolean;
  move?: { dx: number; dy: number; period: number };
};

export type Hazard = {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: "spikes" | "pit" | "puddle";
};

export type Pickup = {
  x: number;
  y: number;
  kind: "butterfly" | "note" | "flower" | "letter" | "gem" | "mark";
  id: string;
};

export type Decor = {
  x: number;
  y: number;
  sprite: string;
  scale?: number;
  flip?: boolean;
  sway?: boolean;
  depth?: number;
  alpha?: number;
  follow?: boolean;
};

export type Npc = {
  x: number;
  y: number;
  sprite: string;
  nameKey: string;
  lineKey: string;
  scale?: number;
};

export type Trigger = {
  x: number;
  y: number;
  w: number;
  h: number;
  event:
    | "dialogue"
    | "look"
    | "red"
    | "bsod"
    | "notepad"
    | "windows"
    | "cursor"
    | "desktop-pony"
    | "gravity"
    | "distort"
    | "ending"
    | "freeze"
    | "black"
    | "glitch"
    | "whisper"
    | "shake"
    | "angel-gone"
    | "stare";
  key?: string;
  once?: boolean;
};

export type LevelDef = {
  id: number;
  width: number;
  height: number;
  sky: string;
  far: string;
  fog?: string;
  plat: string;
  spawn: { x: number; y: number };
  exit: { x: number; y: number; w: number; h: number };
  platforms: Plat[];
  hazards: Hazard[];
  pickups: Pickup[];
  decor: Decor[];
  npcs: Npc[];
  triggers: Trigger[];
  checkpoints: { x: number; y: number }[];
  intro: string[];
  gravity?: number;
  angel?: boolean;
};

const H = 720;
const G = 628;
const TH = 40;

function ground(x: number, w: number, tex: string, y = G): Plat {
  return { x, y, w, h: H - y + 8, tex };
}

function plat(x: number, y: number, w: number, tex: string, oneWay = true): Plat {
  return { x, y, w, h: TH, tex, oneWay };
}

function mover(
  x: number,
  y: number,
  w: number,
  tex: string,
  dx: number,
  dy: number,
  period: number,
): Plat {
  return { x, y, w, h: TH, tex, oneWay: true, move: { dx, dy, period } };
}

function grove(x: number, y = G): Decor[] {
  return [
    { x: x - 30, y, sprite: "tree-3", scale: 0.62, depth: 2 },
    { x: x + 70, y, sprite: "tree-3", scale: 0.48, flip: true, depth: 1, alpha: 0.88 },
    { x: x + 18, y, sprite: "bush", scale: 0.55, depth: 6 },
    { x: x - 70, y, sprite: "grass", scale: 1.1, depth: 7 },
    { x: x + 110, y, sprite: "grass", scale: 0.9, depth: 7 },
  ];
}

function scatter(x0: number, x1: number, y: number, sprite: string, step: number, scale = 1): Decor[] {
  const out: Decor[] = [];
  for (let x = x0; x < x1; x += step) {
    out.push({ x, y, sprite, scale: scale * (0.85 + ((x * 13) % 30) / 100), depth: 7, flip: x % 2 === 0 });
  }
  return out;
}

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    width: 4800,
    height: H,
    sky: "/maps/forest-sky.jpg",
    far: "/maps/forest-far.jpg",
    plat: "grass",
    spawn: { x: 360, y: 500 },
    exit: { x: 4560, y: G - 168, w: 120, h: 168 },
    intro: ["d.intro.1", "d.intro.2", "d.intro.3", "d.intro.4"],
    angel: true,
    npcs: [],
    platforms: [
      ground(0, 920, "grass"),
      plat(640, 510, 190, "grass"),
      plat(880, 400, 170, "wood"),
      plat(1120, 300, 140, "grass"),
      ground(1080, 920, "grass"),
      plat(1560, 490, 200, "grass"),
      plat(1840, 370, 180, "wood"),
      plat(2120, 250, 170, "grass"),
      ground(2360, 740, "grass"),
      plat(2760, 500, 170, "wood"),
      plat(3000, 390, 190, "grass"),
      plat(3240, 280, 150, "wood"),
      ground(3300, 1500, "grass"),
      plat(3720, 500, 210, "wood"),
      plat(4040, 390, 190, "grass"),
    ],
    hazards: [{ x: 920, y: 680, w: 160, h: 50, kind: "pit" }],
    pickups: [
      { x: 720, y: 460, kind: "butterfly", id: "b1" },
      { x: 960, y: 350, kind: "butterfly", id: "b2" },
      { x: 1190, y: 250, kind: "flower", id: "f0" },
      { x: 1900, y: 320, kind: "butterfly", id: "b3" },
      { x: 2200, y: 200, kind: "butterfly", id: "b4" },
      { x: 3080, y: 340, kind: "butterfly", id: "b5" },
      { x: 1600, y: 440, kind: "note", id: "1" },
      { x: 3800, y: 450, kind: "note", id: "2" },
      { x: 4120, y: 340, kind: "flower", id: "f1" },
      { x: 400, y: 560, kind: "note", id: "9" },
      { x: 2160, y: 200, kind: "letter", id: "10" },
      { x: 3280, y: 230, kind: "mark", id: "m1" },
    ],
    decor: [
      { x: 70, y: G, sprite: "cottage", scale: 0.78, depth: 3 },
      { x: 40, y: G, sprite: "computer", scale: 0.5, depth: 8 },
      { x: 560, y: G, sprite: "sign", scale: 0.7, depth: 8 },
      ...grove(520),
      ...grove(1280),
      ...grove(1680),
      ...grove(2500),
      ...grove(3480),
      ...grove(4300),
      ...scatter(40, 880, G, "grass", 70, 1),
      ...scatter(1100, 1980, G, "grass", 80, 1),
      ...scatter(2400, 3000, G, "grass", 70, 1),
      ...scatter(3340, 4700, G, "grass", 80, 1),
      { x: 300, y: G, sprite: "mushroom", scale: 1.1, depth: 8 },
      { x: 1480, y: G, sprite: "rock", scale: 1, depth: 8 },
      { x: 2600, y: G, sprite: "mushroom", scale: 0.9, depth: 8 },
      { x: 4000, y: G, sprite: "rock", scale: 1.1, depth: 8 },
      { x: 1180, y: 300, sprite: "flower", scale: 0.7, depth: 9 },
    ],
    checkpoints: [
      { x: 360, y: 500 },
      { x: 1400, y: 500 },
      { x: 2500, y: 500 },
      { x: 3600, y: 500 },
    ],
    triggers: [
      { x: 80, y: 0, w: 120, h: H, event: "dialogue", key: "d.l1.cottage", once: true },
      { x: 520, y: 0, w: 80, h: H, event: "dialogue", key: "d.l1.sign", once: true },
      { x: 700, y: 0, w: 60, h: H, event: "dialogue", key: "d.l1.angel", once: true },
      { x: 1780, y: 0, w: 80, h: H, event: "dialogue", key: "d.l1.mid", once: true },
      { x: 4380, y: 0, w: 80, h: H, event: "dialogue", key: "d.l1.end", once: true },
    ],
  },
  {
    id: 2,
    width: 5200,
    height: H,
    sky: "/maps/fog-sky.jpg",
    far: "/maps/fog-far.jpg",
    fog: "/maps/fog-overlay.png",
    plat: "grass",
    spawn: { x: 140, y: 500 },
    exit: { x: 4960, y: G - 168, w: 120, h: 168 },
    intro: ["d.l2.start"],
    angel: true,
    npcs: [],
    platforms: [
      ground(0, 760, "grass"),
      plat(800, 510, 170, "wood"),
      plat(1040, 400, 160, "grass"),
      plat(1300, 300, 150, "wood"),
      ground(1560, 640, "grass"),
      plat(2040, 480, 180, "grass"),
      plat(2300, 360, 160, "wood"),
      plat(2580, 240, 170, "grass"),
      ground(2860, 580, "grass"),
      plat(3520, 510, 190, "wood"),
      plat(3800, 400, 170, "grass"),
      plat(4080, 300, 160, "wood"),
      ground(4360, 840, "grass"),
    ],
    hazards: [
      { x: 760, y: 680, w: 800, h: 50, kind: "pit" },
      { x: 2200, y: 680, w: 660, h: 50, kind: "pit" },
      { x: 3440, y: 680, w: 920, h: 50, kind: "pit" },
    ],
    pickups: [
      { x: 1120, y: 350, kind: "note", id: "3" },
      { x: 2660, y: 190, kind: "note", id: "4" },
      { x: 3880, y: 350, kind: "flower", id: "f2" },
      { x: 1360, y: 250, kind: "butterfly", id: "b6" },
      { x: 4600, y: 560, kind: "butterfly", id: "b7" },
    ],
    decor: [
      ...grove(180),
      ...grove(1680),
      ...grove(3000),
      ...grove(4500),
      ...scatter(20, 740, G, "grass", 80, 0.95),
      ...scatter(1580, 2180, G, "grass", 80, 0.9),
      ...scatter(2880, 3420, G, "grass", 80, 0.9),
      ...scatter(4380, 5160, G, "grass", 80, 0.9),
      { x: 620, y: 520, sprite: "eyes", sway: true, follow: true, depth: 8, scale: 0.7 },
      { x: 1960, y: 540, sprite: "eyes", sway: true, follow: true, depth: 8, scale: 0.8 },
      { x: 3180, y: 530, sprite: "eyes", sway: true, follow: true, depth: 8, scale: 0.75 },
      { x: 4700, y: 520, sprite: "eyes", sway: true, follow: true, depth: 8, scale: 0.85 },
      { x: 900, y: 510, sprite: "bush", scale: 0.45, depth: 5, alpha: 0.85 },
      { x: 2400, y: 360, sprite: "bush", scale: 0.4, depth: 5, alpha: 0.8 },
      { x: 200, y: 480, sprite: "discord", scale: 0.35, depth: 1, alpha: 0.25, follow: true },
    ],
    checkpoints: [
      { x: 140, y: 500 },
      { x: 1680, y: 500 },
      { x: 3000, y: 500 },
    ],
    triggers: [
      { x: 900, y: 0, w: 50, h: H, event: "angel-gone", once: true },
      { x: 2480, y: 0, w: 60, h: H, event: "look", key: "d.l2.look", once: true },
      { x: 3600, y: 0, w: 50, h: H, event: "whisper", key: "whisper.1", once: true },
      { x: 4700, y: 0, w: 60, h: H, event: "dialogue", key: "d.l2.end", once: true },
    ],
  },
  {
    id: 3,
    width: 5400,
    height: H,
    sky: "/maps/blood-sky.jpg",
    far: "/maps/blood-far.jpg",
    fog: "/maps/blood-fog.png",
    plat: "blood",
    spawn: { x: 140, y: 500 },
    exit: { x: 5160, y: G - 168, w: 120, h: 168 },
    intro: ["d.l3.start"],
    npcs: [
      { x: 1720, y: 40, sprite: "hang-blue", nameKey: "npc.rd", lineKey: "npc.rd.line", scale: 0.9 },
      { x: 2160, y: 10, sprite: "hang-purple", nameKey: "npc.tw", lineKey: "npc.tw.line", scale: 0.85 },
      { x: 3060, y: 20, sprite: "hang-pink", nameKey: "npc.pp", lineKey: "npc.pp.line", scale: 0.95 },
      { x: 3980, y: 0, sprite: "hang-white", nameKey: "npc.rar", lineKey: "npc.rar.line", scale: 0.8 },
      { x: 4880, y: 30, sprite: "hang-orange", nameKey: "npc.aj", lineKey: "npc.aj.line", scale: 0.9 },
    ],
    platforms: [
      ground(0, 680, "blood"),
      plat(720, 510, 160, "blood"),
      plat(960, 410, 150, "wood"),
      plat(1200, 300, 160, "blood"),
      ground(1460, 540, "blood"),
      plat(2080, 490, 170, "blood"),
      plat(2340, 370, 160, "wood"),
      plat(2600, 250, 170, "blood"),
      ground(2880, 660, "blood"),
      plat(3620, 510, 180, "blood"),
      plat(3900, 390, 170, "wood"),
      plat(4180, 270, 160, "blood"),
      ground(4460, 940, "blood"),
    ],
    hazards: [
      { x: 680, y: 680, w: 780, h: 50, kind: "pit" },
      { x: 2000, y: 680, w: 880, h: 50, kind: "pit" },
      { x: 3540, y: 680, w: 920, h: 50, kind: "pit" },
      { x: 1640, y: G - 20, w: 96, h: 28, kind: "spikes" },
      { x: 3180, y: G - 20, w: 96, h: 28, kind: "spikes" },
      { x: 4780, y: G - 16, w: 140, h: 24, kind: "puddle" },
    ],
    pickups: [
      { x: 1280, y: 250, kind: "note", id: "5" },
      { x: 2680, y: 200, kind: "note", id: "6" },
      { x: 3980, y: 340, kind: "flower", id: "f3" },
      { x: 500, y: 560, kind: "note", id: "11" },
      { x: 2340, y: 320, kind: "note", id: "12" },
      { x: 4180, y: 220, kind: "note", id: "13" },
      { x: 5000, y: 560, kind: "note", id: "14" },
    ],
    decor: [
      { x: 200, y: G, sprite: "tree-2", scale: 0.65, depth: 2, alpha: 0.85 },
      { x: 480, y: G, sprite: "tree-3", scale: 0.5, depth: 1, alpha: 0.7 },
      { x: 1700, y: G, sprite: "tree-2", scale: 0.6, depth: 2, alpha: 0.75 },
      { x: 3100, y: G, sprite: "tree-1", scale: 0.7, depth: 1, alpha: 0.7 },
      { x: 4600, y: G, sprite: "tree-3", scale: 0.55, depth: 2, alpha: 0.8 },
      { x: 360, y: G, sprite: "poster", scale: 0.85, depth: 8 },
      { x: 900, y: 80, sprite: "drip", sway: true, depth: 9, scale: 1.4 },
      { x: 2400, y: 60, sprite: "drip", sway: true, depth: 9, scale: 1.2 },
      { x: 4000, y: 40, sprite: "drip", sway: true, depth: 9, scale: 1.6 },
      { x: 600, y: 520, sprite: "eyes", follow: true, sway: true, depth: 8, scale: 0.8 },
      { x: 2800, y: 500, sprite: "eyes", follow: true, sway: true, depth: 8, scale: 0.9 },
      { x: 1400, y: 80, sprite: "vine", depth: 5, scale: 1.2 },
      { x: 3500, y: 40, sprite: "vine", depth: 5, scale: 1.4, flip: true },
    ],
    checkpoints: [
      { x: 140, y: 500 },
      { x: 1560, y: 500 },
      { x: 3000, y: 500 },
    ],
    triggers: [
      { x: 300, y: 0, w: 50, h: H, event: "dialogue", key: "d.l3.poster", once: true },
      { x: 1860, y: 0, w: 50, h: H, event: "red", key: "red.1", once: true },
      { x: 2680, y: 0, w: 50, h: H, event: "dialogue", key: "d.l3.whisper", once: true },
      { x: 3720, y: 0, w: 50, h: H, event: "red", key: "red.2", once: true },
      { x: 4500, y: 0, w: 40, h: H, event: "red", key: "red.6", once: true },
      { x: 4900, y: 0, w: 50, h: H, event: "dialogue", key: "d.l3.end", once: true },
    ],
  },
  {
    id: 4,
    width: 5000,
    height: H,
    sky: "/maps/void-sky.jpg",
    far: "/maps/void-far.jpg",
    plat: "glitch",
    spawn: { x: 140, y: 500 },
    exit: { x: 4760, y: G - 168, w: 120, h: 168 },
    intro: ["d.l4.start"],
    npcs: [],
    platforms: [
      ground(0, 580, "glitch"),
      plat(660, 510, 150, "glitch"),
      plat(900, 410, 140, "void"),
      plat(1140, 300, 150, "glitch"),
      plat(1400, 430, 160, "void"),
      ground(1680, 500, "glitch"),
      mover(2260, 500, 150, "glitch", 0, -160, 3200),
      plat(2520, 360, 150, "void"),
      plat(2780, 240, 160, "glitch"),
      ground(3060, 540, "glitch"),
      plat(3680, 490, 170, "void"),
      plat(3960, 360, 160, "glitch"),
      ground(4240, 760, "glitch"),
    ],
    hazards: [
      { x: 580, y: 680, w: 1100, h: 50, kind: "pit" },
      { x: 2180, y: 680, w: 880, h: 50, kind: "pit" },
      { x: 3600, y: 680, w: 640, h: 50, kind: "pit" },
    ],
    pickups: [
      { x: 2860, y: 190, kind: "note", id: "7" },
      { x: 1800, y: 560, kind: "note", id: "15" },
    ],
    decor: [
      { x: 200, y: G, sprite: "tree-1", scale: 0.5, depth: 2, alpha: 0.45 },
      { x: 420, y: G, sprite: "computer", scale: 0.7, depth: 8 },
      { x: 1800, y: G, sprite: "tree-2", scale: 0.48, depth: 2, alpha: 0.4 },
      { x: 4400, y: G, sprite: "tree-1", scale: 0.55, depth: 2, alpha: 0.35 },
      { x: 800, y: 480, sprite: "eyes", follow: true, depth: 8, scale: 0.7 },
      { x: 2400, y: 200, sprite: "eyes", follow: true, depth: 8, scale: 0.9 },
      { x: 3200, y: 200, sprite: "discord", scale: 0.55, depth: 5, alpha: 0.7, follow: true, sway: true },
    ],
    checkpoints: [
      { x: 140, y: 500 },
      { x: 1760, y: 500 },
      { x: 3160, y: 500 },
    ],
    triggers: [
      { x: 380, y: 0, w: 40, h: H, event: "dialogue", key: "d.l4.comp", once: true },
      { x: 900, y: 0, w: 40, h: H, event: "freeze", once: true },
      { x: 1600, y: 0, w: 40, h: H, event: "bsod", once: true },
      { x: 2400, y: 0, w: 40, h: H, event: "dialogue", key: "d.l4.after", once: true },
      { x: 3100, y: 0, w: 40, h: H, event: "dialogue", key: "d.l4.discord", once: true },
      { x: 4000, y: 0, w: 40, h: H, event: "red", key: "red.3", once: true },
    ],
  },
  {
    id: 5,
    width: 5200,
    height: H,
    sky: "/maps/desktop-corrupt.jpg",
    far: "/maps/forest-far.jpg",
    plat: "stone",
    spawn: { x: 140, y: 500 },
    exit: { x: 4960, y: G - 168, w: 120, h: 168 },
    intro: ["d.l5.1", "d.l5.2", "d.l5.3"],
    npcs: [],
    platforms: [
      ground(0, 640, "stone"),
      plat(720, 510, 170, "wood"),
      plat(980, 400, 160, "stone"),
      plat(1240, 280, 160, "wood"),
      ground(1520, 560, "stone"),
      mover(2160, 480, 160, "wood", 180, 0, 2800),
      plat(2480, 350, 160, "stone"),
      plat(2760, 230, 170, "wood"),
      ground(3040, 600, "stone"),
      plat(3720, 500, 180, "wood"),
      plat(4020, 370, 170, "stone"),
      ground(4340, 860, "stone"),
    ],
    hazards: [
      { x: 640, y: 680, w: 880, h: 50, kind: "pit" },
      { x: 2080, y: 680, w: 960, h: 50, kind: "pit" },
      { x: 3640, y: 680, w: 700, h: 50, kind: "pit" },
    ],
    pickups: [{ x: 2840, y: 180, kind: "note", id: "8" }],
    decor: [
      { x: 1880, y: 40, sprite: "hang-yellow", sway: true, scale: 0.75, depth: 6 },
      { x: 700, y: 480, sprite: "eyes", follow: true, depth: 8, scale: 0.85 },
      { x: 2600, y: 200, sprite: "eyes", follow: true, depth: 8, scale: 1 },
      { x: 4200, y: 480, sprite: "eyes", follow: true, depth: 8, scale: 0.9 },
      { x: 200, y: G, sprite: "tree-1", scale: 0.45, depth: 2, alpha: 0.35 },
      { x: 3400, y: 180, sprite: "discord", scale: 0.4, depth: 2, alpha: 0.4, follow: true },
    ],
    checkpoints: [
      { x: 140, y: 500 },
      { x: 1640, y: 500 },
      { x: 3160, y: 500 },
    ],
    triggers: [
      { x: 1860, y: 0, w: 40, h: H, event: "windows", once: true },
      { x: 2200, y: 0, w: 40, h: H, event: "stare", key: "d.l5.stare", once: true },
      { x: 2500, y: 0, w: 40, h: H, event: "cursor", once: true },
      { x: 3300, y: 0, w: 40, h: H, event: "notepad", key: "notepad.1", once: true },
      { x: 3900, y: 0, w: 40, h: H, event: "glitch", once: true },
      { x: 4400, y: 0, w: 40, h: H, event: "desktop-pony", once: true },
      { x: 4600, y: 0, w: 40, h: H, event: "whisper", key: "whisper.2", once: true },
    ],
  },
  {
    id: 6,
    width: 5600,
    height: H,
    sky: "/maps/glitch-far.jpg",
    far: "/maps/glitch-far.jpg",
    plat: "void",
    spawn: { x: 140, y: 500 },
    exit: { x: 5360, y: G - 168, w: 120, h: 168 },
    intro: ["d.l6.1", "d.l6.2"],
    gravity: 1,
    npcs: [
      { x: 2100, y: 20, sprite: "hang-blue", nameKey: "npc.rd", lineKey: "npc.rd.line", scale: 1.1 },
      { x: 2600, y: 0, sprite: "hang-purple", nameKey: "npc.tw", lineKey: "npc.tw.line", scale: 1.2 },
      { x: 4300, y: 10, sprite: "hang-pink", nameKey: "npc.pp", lineKey: "npc.pp.line", scale: 1.05 },
    ],
    platforms: [
      ground(0, 540, "void"),
      plat(640, 510, 150, "glitch"),
      plat(880, 390, 140, "void"),
      plat(1120, 260, 150, "glitch"),
      plat(1380, 400, 160, "void"),
      plat(1660, 280, 150, "glitch"),
      ground(1920, 440, "void"),
      mover(2440, 500, 150, "glitch", 0, -180, 3000),
      plat(2720, 340, 150, "void"),
      plat(2980, 210, 160, "glitch"),
      plat(3260, 330, 150, "void"),
      ground(3540, 520, "void"),
      plat(4140, 490, 170, "glitch"),
      plat(4420, 350, 160, "void"),
      plat(4700, 220, 160, "glitch"),
      ground(4980, 620, "void"),
    ],
    hazards: [
      { x: 540, y: 680, w: 1380, h: 50, kind: "pit" },
      { x: 2360, y: 680, w: 1180, h: 50, kind: "pit" },
      { x: 4060, y: 680, w: 920, h: 50, kind: "pit" },
      { x: 3720, y: G - 20, w: 96, h: 28, kind: "spikes" },
    ],
    pickups: [
      { x: 3060, y: 160, kind: "flower", id: "f6" },
      { x: 1660, y: 230, kind: "gem", id: "16" },
      { x: 4700, y: 170, kind: "mark", id: "m6" },
    ],
    decor: [
      { x: 1200, y: 200, sprite: "eyes", follow: true, depth: 8, scale: 1.1 },
      { x: 3200, y: 120, sprite: "eyes", follow: true, depth: 8, scale: 1.2 },
      { x: 5000, y: 400, sprite: "eyes", follow: true, depth: 8, scale: 1.3 },
      { x: 3800, y: 80, sprite: "discord", scale: 0.7, depth: 4, alpha: 0.55, follow: true, sway: true },
    ],
    checkpoints: [
      { x: 140, y: 500 },
      { x: 2000, y: 500 },
      { x: 3640, y: 500 },
    ],
    triggers: [
      { x: 1500, y: 0, w: 40, h: H, event: "distort", once: true },
      { x: 1700, y: 0, w: 40, h: H, event: "dialogue", key: "d.l6.gem", once: true },
      { x: 2500, y: 0, w: 40, h: H, event: "gravity", once: true },
      { x: 3300, y: 0, w: 40, h: H, event: "look", key: "red.4", once: true },
      { x: 4100, y: 0, w: 40, h: H, event: "black", key: "black.1", once: true },
      { x: 4900, y: 0, w: 40, h: H, event: "red", key: "red.5", once: true },
      { x: 5100, y: 0, w: 40, h: H, event: "red", key: "red.8", once: true },
    ],
  },
  {
    id: 7,
    width: 3000,
    height: H,
    sky: "/maps/finale-sky.jpg",
    far: "/maps/finale-sky.jpg",
    plat: "void",
    spawn: { x: 180, y: 500 },
    exit: { x: 2680, y: G - 168, w: 120, h: 168 },
    intro: ["d.fin.1", "d.fin.2", "d.fin.3", "d.fin.4"],
    npcs: [{ x: 720, y: 20, sprite: "hang-yellow", nameKey: "npc.fs", lineKey: "npc.fs.line", scale: 1.35 }],
    platforms: [
      ground(0, 960, "void"),
      plat(1040, 510, 190, "glitch"),
      plat(1320, 390, 170, "void"),
      plat(1600, 270, 190, "glitch"),
      ground(1920, 1080, "void"),
    ],
    hazards: [{ x: 960, y: 680, w: 960, h: 50, kind: "pit" }],
    pickups: [],
    decor: [
      { x: 1480, y: -20, sprite: "hang-blue", sway: true, scale: 1.45, depth: 6 },
      { x: 400, y: 400, sprite: "eyes", follow: true, depth: 8, scale: 1.4 },
      { x: 2200, y: 360, sprite: "eyes", follow: true, depth: 8, scale: 1.6 },
      { x: 2400, y: 80, sprite: "discord", scale: 0.85, depth: 3, alpha: 0.45, follow: true },
    ],
    checkpoints: [{ x: 180, y: 500 }],
    triggers: [
      { x: 2000, y: 0, w: 60, h: H, event: "stare", key: "d.fin.look", once: true },
      { x: 2500, y: 0, w: 80, h: H, event: "ending", once: true },
    ],
  },
];

export function getLevel(id: number): LevelDef {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
