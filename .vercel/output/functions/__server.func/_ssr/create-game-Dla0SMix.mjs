import { a as setMusicBed, c as bridge, i as playSfx, n as useGameStore, o as readActions, r as hushMusic, s as setInjectedKeys } from "./routes-B2Q9B1Iz.mjs";
import { a as __webpack_exports__Scene, i as __webpack_exports__Scale, n as __webpack_exports__Game, r as __webpack_exports__Math, t as __webpack_exports__AUTO } from "../_libs/phaser.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/create-game-Dla0SMix.js
var BootScene = class extends __webpack_exports__Scene {
	constructor() {
		super("boot");
	}
	create() {
		this.scene.start("preload");
	}
};
function installControlsTest(getPony) {
	window.__controlsTest = {
		getYaw: () => {
			const p = getPony();
			if (!p) return 0;
			return p.facing < 0 ? .4 : 0;
		},
		getSpeed: () => {
			const p = getPony();
			if (!p) return 0;
			const b = p.sprite.body;
			if (!b) return 0;
			return Math.max(Math.abs(b.velocity.x), Math.abs(b.velocity.y));
		},
		setKeys: (codes) => {
			setInjectedKeys(codes);
		},
		setSteer: (v) => {
			if (v > .2) setInjectedKeys(["KeyA"]);
			else if (v < -.2) setInjectedKeys(["KeyD"]);
			else setInjectedKeys([]);
		}
	};
}
var H = 720;
var G = 628;
var TH = 40;
function ground(x, w, tex, y = G) {
	return {
		x,
		y,
		w,
		h: H - y + 8,
		tex
	};
}
function plat(x, y, w, tex, oneWay = true) {
	return {
		x,
		y,
		w,
		h: TH,
		tex,
		oneWay
	};
}
function mover(x, y, w, tex, dx, dy, period) {
	return {
		x,
		y,
		w,
		h: TH,
		tex,
		oneWay: true,
		move: {
			dx,
			dy,
			period
		}
	};
}
function grove(x, y = G) {
	return [
		{
			x: x - 30,
			y,
			sprite: "tree-1",
			scale: .7,
			depth: 2
		},
		{
			x: x + 70,
			y,
			sprite: "tree-2",
			scale: .58,
			flip: true,
			depth: 1,
			alpha: .92
		},
		{
			x: x + 18,
			y,
			sprite: "bush",
			scale: .55,
			depth: 6
		},
		{
			x: x - 70,
			y,
			sprite: "grass",
			scale: 1.1,
			depth: 7
		},
		{
			x: x + 110,
			y,
			sprite: "grass",
			scale: .9,
			depth: 7
		}
	];
}
function scatter(x0, x1, y, sprite, step, scale = 1) {
	const out = [];
	for (let x = x0; x < x1; x += step) out.push({
		x,
		y,
		sprite,
		scale: scale * (.85 + x * 13 % 30 / 100),
		depth: 7,
		flip: x % 2 === 0
	});
	return out;
}
var LEVELS = [
	{
		id: 1,
		width: 4800,
		height: H,
		sky: "/maps/forest-sky.jpg",
		far: "/maps/forest-far.jpg",
		plat: "grass",
		spawn: {
			x: 160,
			y: 500
		},
		exit: {
			x: 4560,
			y: 460,
			w: 120,
			h: 168
		},
		intro: [
			"d.intro.1",
			"d.intro.2",
			"d.intro.3"
		],
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
			plat(3e3, 390, 190, "grass"),
			plat(3240, 280, 150, "wood"),
			ground(3300, 1500, "grass"),
			plat(3720, 500, 210, "wood"),
			plat(4040, 390, 190, "grass")
		],
		hazards: [{
			x: 920,
			y: 680,
			w: 160,
			h: 50,
			kind: "pit"
		}],
		pickups: [
			{
				x: 720,
				y: 460,
				kind: "butterfly",
				id: "b1"
			},
			{
				x: 960,
				y: 350,
				kind: "butterfly",
				id: "b2"
			},
			{
				x: 1190,
				y: 250,
				kind: "flower",
				id: "f0"
			},
			{
				x: 1900,
				y: 320,
				kind: "butterfly",
				id: "b3"
			},
			{
				x: 2200,
				y: 200,
				kind: "butterfly",
				id: "b4"
			},
			{
				x: 3080,
				y: 340,
				kind: "butterfly",
				id: "b5"
			},
			{
				x: 1600,
				y: 440,
				kind: "note",
				id: "1"
			},
			{
				x: 3800,
				y: 450,
				kind: "note",
				id: "2"
			},
			{
				x: 4120,
				y: 340,
				kind: "flower",
				id: "f1"
			}
		],
		decor: [
			...grove(220),
			...grove(520),
			...grove(1280),
			...grove(1680),
			...grove(2500),
			...grove(3480),
			...grove(4300),
			...scatter(40, 880, G, "grass", 70, 1),
			...scatter(1100, 1980, G, "grass", 80, 1),
			...scatter(2400, 3e3, G, "grass", 70, 1),
			...scatter(3340, 4700, G, "grass", 80, 1),
			{
				x: 300,
				y: G,
				sprite: "mushroom",
				scale: 1.1,
				depth: 8
			},
			{
				x: 1480,
				y: G,
				sprite: "rock",
				scale: 1,
				depth: 8
			},
			{
				x: 2600,
				y: G,
				sprite: "mushroom",
				scale: .9,
				depth: 8
			},
			{
				x: 4e3,
				y: G,
				sprite: "rock",
				scale: 1.1,
				depth: 8
			},
			{
				x: 1180,
				y: 300,
				sprite: "flower",
				scale: .7,
				depth: 9
			}
		],
		checkpoints: [
			{
				x: 160,
				y: 500
			},
			{
				x: 1400,
				y: 500
			},
			{
				x: 2500,
				y: 500
			},
			{
				x: 3600,
				y: 500
			}
		],
		triggers: [{
			x: 1780,
			y: 0,
			w: 80,
			h: H,
			event: "dialogue",
			key: "d.l1.mid",
			once: true
		}, {
			x: 4380,
			y: 0,
			w: 80,
			h: H,
			event: "dialogue",
			key: "d.l1.end",
			once: true
		}]
	},
	{
		id: 2,
		width: 5200,
		height: H,
		sky: "/maps/fog-sky.jpg",
		far: "/maps/fog-far.jpg",
		fog: "/maps/fog-overlay.png",
		plat: "grass",
		spawn: {
			x: 140,
			y: 500
		},
		exit: {
			x: 4960,
			y: 460,
			w: 120,
			h: 168
		},
		intro: ["d.l2.start"],
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
			ground(4360, 840, "grass")
		],
		hazards: [
			{
				x: 760,
				y: 680,
				w: 800,
				h: 50,
				kind: "pit"
			},
			{
				x: 2200,
				y: 680,
				w: 660,
				h: 50,
				kind: "pit"
			},
			{
				x: 3440,
				y: 680,
				w: 920,
				h: 50,
				kind: "pit"
			}
		],
		pickups: [
			{
				x: 1120,
				y: 350,
				kind: "note",
				id: "3"
			},
			{
				x: 2660,
				y: 190,
				kind: "note",
				id: "4"
			},
			{
				x: 3880,
				y: 350,
				kind: "flower",
				id: "f2"
			},
			{
				x: 1360,
				y: 250,
				kind: "butterfly",
				id: "b6"
			}
		],
		decor: [
			...grove(180),
			...grove(1680),
			...grove(3e3),
			...grove(4500),
			...scatter(20, 740, G, "grass", 80, .95),
			...scatter(1580, 2180, G, "grass", 80, .9),
			...scatter(2880, 3420, G, "grass", 80, .9),
			...scatter(4380, 5160, G, "grass", 80, .9),
			{
				x: 620,
				y: 520,
				sprite: "eyes",
				sway: true,
				follow: true,
				depth: 8,
				scale: .7
			},
			{
				x: 1960,
				y: 540,
				sprite: "eyes",
				sway: true,
				follow: true,
				depth: 8,
				scale: .8
			},
			{
				x: 3180,
				y: 530,
				sprite: "eyes",
				sway: true,
				follow: true,
				depth: 8,
				scale: .75
			},
			{
				x: 4700,
				y: 520,
				sprite: "eyes",
				sway: true,
				follow: true,
				depth: 8,
				scale: .85
			},
			{
				x: 900,
				y: 510,
				sprite: "bush",
				scale: .45,
				depth: 5,
				alpha: .85
			},
			{
				x: 2400,
				y: 360,
				sprite: "bush",
				scale: .4,
				depth: 5,
				alpha: .8
			}
		],
		checkpoints: [
			{
				x: 140,
				y: 500
			},
			{
				x: 1680,
				y: 500
			},
			{
				x: 3e3,
				y: 500
			}
		],
		triggers: [
			{
				x: 2480,
				y: 0,
				w: 60,
				h: H,
				event: "look",
				key: "d.l2.look",
				once: true
			},
			{
				x: 3600,
				y: 0,
				w: 50,
				h: H,
				event: "whisper",
				key: "whisper.1",
				once: true
			},
			{
				x: 4700,
				y: 0,
				w: 60,
				h: H,
				event: "dialogue",
				key: "d.l2.end",
				once: true
			}
		]
	},
	{
		id: 3,
		width: 5400,
		height: H,
		sky: "/maps/blood-sky.jpg",
		far: "/maps/blood-far.jpg",
		fog: "/maps/blood-fog.png",
		plat: "blood",
		spawn: {
			x: 140,
			y: 500
		},
		exit: {
			x: 5160,
			y: 460,
			w: 120,
			h: 168
		},
		intro: ["d.l3.start"],
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
			ground(4460, 940, "blood")
		],
		hazards: [
			{
				x: 680,
				y: 680,
				w: 780,
				h: 50,
				kind: "pit"
			},
			{
				x: 2e3,
				y: 680,
				w: 880,
				h: 50,
				kind: "pit"
			},
			{
				x: 3540,
				y: 680,
				w: 920,
				h: 50,
				kind: "pit"
			},
			{
				x: 1640,
				y: 608,
				w: 96,
				h: 28,
				kind: "spikes"
			},
			{
				x: 3180,
				y: 608,
				w: 96,
				h: 28,
				kind: "spikes"
			},
			{
				x: 4780,
				y: 612,
				w: 140,
				h: 24,
				kind: "puddle"
			}
		],
		pickups: [
			{
				x: 1280,
				y: 250,
				kind: "note",
				id: "5"
			},
			{
				x: 2680,
				y: 200,
				kind: "note",
				id: "6"
			},
			{
				x: 3980,
				y: 340,
				kind: "flower",
				id: "f3"
			}
		],
		decor: [
			{
				x: 200,
				y: G,
				sprite: "tree-2",
				scale: .65,
				depth: 2,
				alpha: .85
			},
			{
				x: 480,
				y: G,
				sprite: "tree-1",
				scale: .55,
				depth: 1,
				alpha: .7
			},
			{
				x: 1700,
				y: G,
				sprite: "tree-2",
				scale: .6,
				depth: 2,
				alpha: .75
			},
			{
				x: 3100,
				y: G,
				sprite: "tree-1",
				scale: .7,
				depth: 1,
				alpha: .7
			},
			{
				x: 4600,
				y: G,
				sprite: "tree-2",
				scale: .62,
				depth: 2,
				alpha: .8
			},
			{
				x: 1720,
				y: 40,
				sprite: "hang-blue",
				sway: true,
				scale: .9,
				depth: 6
			},
			{
				x: 2160,
				y: 10,
				sprite: "hang-purple",
				sway: true,
				scale: .85,
				depth: 6
			},
			{
				x: 3060,
				y: 20,
				sprite: "hang-pink",
				sway: true,
				scale: .95,
				depth: 6
			},
			{
				x: 3980,
				y: 0,
				sprite: "hang-white",
				sway: true,
				scale: .8,
				depth: 6
			},
			{
				x: 4880,
				y: 30,
				sprite: "hang-orange",
				sway: true,
				scale: .9,
				depth: 6
			},
			{
				x: 900,
				y: 80,
				sprite: "drip",
				sway: true,
				depth: 9,
				scale: 1.4
			},
			{
				x: 2400,
				y: 60,
				sprite: "drip",
				sway: true,
				depth: 9,
				scale: 1.2
			},
			{
				x: 4e3,
				y: 40,
				sprite: "drip",
				sway: true,
				depth: 9,
				scale: 1.6
			},
			{
				x: 600,
				y: 520,
				sprite: "eyes",
				follow: true,
				sway: true,
				depth: 8,
				scale: .8
			},
			{
				x: 2800,
				y: 500,
				sprite: "eyes",
				follow: true,
				sway: true,
				depth: 8,
				scale: .9
			},
			{
				x: 1400,
				y: 80,
				sprite: "vine",
				depth: 5,
				scale: 1.2
			},
			{
				x: 3500,
				y: 40,
				sprite: "vine",
				depth: 5,
				scale: 1.4,
				flip: true
			}
		],
		checkpoints: [
			{
				x: 140,
				y: 500
			},
			{
				x: 1560,
				y: 500
			},
			{
				x: 3e3,
				y: 500
			}
		],
		triggers: [
			{
				x: 1860,
				y: 0,
				w: 50,
				h: H,
				event: "red",
				key: "red.1",
				once: true
			},
			{
				x: 2680,
				y: 0,
				w: 50,
				h: H,
				event: "dialogue",
				key: "d.l3.whisper",
				once: true
			},
			{
				x: 3720,
				y: 0,
				w: 50,
				h: H,
				event: "red",
				key: "red.2",
				once: true
			},
			{
				x: 4900,
				y: 0,
				w: 50,
				h: H,
				event: "dialogue",
				key: "d.l3.end",
				once: true
			}
		]
	},
	{
		id: 4,
		width: 5e3,
		height: H,
		sky: "/maps/void-sky.jpg",
		far: "/maps/void-far.jpg",
		plat: "glitch",
		spawn: {
			x: 140,
			y: 500
		},
		exit: {
			x: 4760,
			y: 460,
			w: 120,
			h: 168
		},
		intro: ["d.l4.start"],
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
			ground(4240, 760, "glitch")
		],
		hazards: [
			{
				x: 580,
				y: 680,
				w: 1100,
				h: 50,
				kind: "pit"
			},
			{
				x: 2180,
				y: 680,
				w: 880,
				h: 50,
				kind: "pit"
			},
			{
				x: 3600,
				y: 680,
				w: 640,
				h: 50,
				kind: "pit"
			}
		],
		pickups: [{
			x: 2860,
			y: 190,
			kind: "note",
			id: "7"
		}],
		decor: [
			{
				x: 200,
				y: G,
				sprite: "tree-1",
				scale: .5,
				depth: 2,
				alpha: .45
			},
			{
				x: 1800,
				y: G,
				sprite: "tree-2",
				scale: .48,
				depth: 2,
				alpha: .4
			},
			{
				x: 4400,
				y: G,
				sprite: "tree-1",
				scale: .55,
				depth: 2,
				alpha: .35
			},
			{
				x: 800,
				y: 480,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: .7
			},
			{
				x: 2400,
				y: 200,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: .9
			}
		],
		checkpoints: [
			{
				x: 140,
				y: 500
			},
			{
				x: 1760,
				y: 500
			},
			{
				x: 3160,
				y: 500
			}
		],
		triggers: [
			{
				x: 900,
				y: 0,
				w: 40,
				h: H,
				event: "freeze",
				once: true
			},
			{
				x: 1600,
				y: 0,
				w: 40,
				h: H,
				event: "bsod",
				once: true
			},
			{
				x: 2400,
				y: 0,
				w: 40,
				h: H,
				event: "dialogue",
				key: "d.l4.after",
				once: true
			},
			{
				x: 4e3,
				y: 0,
				w: 40,
				h: H,
				event: "red",
				key: "red.3",
				once: true
			}
		]
	},
	{
		id: 5,
		width: 5200,
		height: H,
		sky: "/maps/desktop-corrupt.jpg",
		far: "/maps/forest-far.jpg",
		plat: "stone",
		spawn: {
			x: 140,
			y: 500
		},
		exit: {
			x: 4960,
			y: 460,
			w: 120,
			h: 168
		},
		intro: [
			"d.l5.1",
			"d.l5.2",
			"d.l5.3"
		],
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
			ground(4340, 860, "stone")
		],
		hazards: [
			{
				x: 640,
				y: 680,
				w: 880,
				h: 50,
				kind: "pit"
			},
			{
				x: 2080,
				y: 680,
				w: 960,
				h: 50,
				kind: "pit"
			},
			{
				x: 3640,
				y: 680,
				w: 700,
				h: 50,
				kind: "pit"
			}
		],
		pickups: [{
			x: 2840,
			y: 180,
			kind: "note",
			id: "8"
		}],
		decor: [
			{
				x: 1880,
				y: 40,
				sprite: "hang-yellow",
				sway: true,
				scale: .75,
				depth: 6
			},
			{
				x: 700,
				y: 480,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: .85
			},
			{
				x: 2600,
				y: 200,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: 1
			},
			{
				x: 4200,
				y: 480,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: .9
			},
			{
				x: 200,
				y: G,
				sprite: "tree-1",
				scale: .45,
				depth: 2,
				alpha: .35
			}
		],
		checkpoints: [
			{
				x: 140,
				y: 500
			},
			{
				x: 1640,
				y: 500
			},
			{
				x: 3160,
				y: 500
			}
		],
		triggers: [
			{
				x: 1860,
				y: 0,
				w: 40,
				h: H,
				event: "windows",
				once: true
			},
			{
				x: 2500,
				y: 0,
				w: 40,
				h: H,
				event: "cursor",
				once: true
			},
			{
				x: 3300,
				y: 0,
				w: 40,
				h: H,
				event: "notepad",
				key: "notepad.1",
				once: true
			},
			{
				x: 3900,
				y: 0,
				w: 40,
				h: H,
				event: "glitch",
				once: true
			},
			{
				x: 4400,
				y: 0,
				w: 40,
				h: H,
				event: "desktop-pony",
				once: true
			}
		]
	},
	{
		id: 6,
		width: 5600,
		height: H,
		sky: "/maps/glitch-far.jpg",
		far: "/maps/glitch-far.jpg",
		plat: "void",
		spawn: {
			x: 140,
			y: 500
		},
		exit: {
			x: 5360,
			y: 460,
			w: 120,
			h: 168
		},
		intro: ["d.l6.1", "d.l6.2"],
		gravity: 1,
		platforms: [
			ground(0, 540, "void"),
			plat(640, 510, 150, "glitch"),
			plat(880, 390, 140, "void"),
			plat(1120, 260, 150, "glitch"),
			plat(1380, 400, 160, "void"),
			plat(1660, 280, 150, "glitch"),
			ground(1920, 440, "void"),
			mover(2440, 500, 150, "glitch", 0, -180, 3e3),
			plat(2720, 340, 150, "void"),
			plat(2980, 210, 160, "glitch"),
			plat(3260, 330, 150, "void"),
			ground(3540, 520, "void"),
			plat(4140, 490, 170, "glitch"),
			plat(4420, 350, 160, "void"),
			plat(4700, 220, 160, "glitch"),
			ground(4980, 620, "void")
		],
		hazards: [
			{
				x: 540,
				y: 680,
				w: 1380,
				h: 50,
				kind: "pit"
			},
			{
				x: 2360,
				y: 680,
				w: 1180,
				h: 50,
				kind: "pit"
			},
			{
				x: 4060,
				y: 680,
				w: 920,
				h: 50,
				kind: "pit"
			},
			{
				x: 3720,
				y: 608,
				w: 96,
				h: 28,
				kind: "spikes"
			}
		],
		pickups: [{
			x: 3060,
			y: 160,
			kind: "flower",
			id: "f6"
		}],
		decor: [
			{
				x: 2100,
				y: 20,
				sprite: "hang-blue",
				sway: true,
				scale: 1.1,
				depth: 6
			},
			{
				x: 2600,
				y: 0,
				sprite: "hang-purple",
				sway: true,
				scale: 1.2,
				depth: 6
			},
			{
				x: 4300,
				y: 10,
				sprite: "hang-pink",
				sway: true,
				scale: 1.05,
				depth: 6
			},
			{
				x: 1200,
				y: 200,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: 1.1
			},
			{
				x: 3200,
				y: 120,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: 1.2
			},
			{
				x: 5e3,
				y: 400,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: 1.3
			}
		],
		checkpoints: [
			{
				x: 140,
				y: 500
			},
			{
				x: 2e3,
				y: 500
			},
			{
				x: 3640,
				y: 500
			}
		],
		triggers: [
			{
				x: 1500,
				y: 0,
				w: 40,
				h: H,
				event: "distort",
				once: true
			},
			{
				x: 2500,
				y: 0,
				w: 40,
				h: H,
				event: "gravity",
				once: true
			},
			{
				x: 3300,
				y: 0,
				w: 40,
				h: H,
				event: "look",
				key: "red.4",
				once: true
			},
			{
				x: 4100,
				y: 0,
				w: 40,
				h: H,
				event: "black",
				key: "black.1",
				once: true
			},
			{
				x: 4900,
				y: 0,
				w: 40,
				h: H,
				event: "red",
				key: "red.5",
				once: true
			}
		]
	},
	{
		id: 7,
		width: 3e3,
		height: H,
		sky: "/maps/finale-sky.jpg",
		far: "/maps/finale-sky.jpg",
		plat: "void",
		spawn: {
			x: 180,
			y: 500
		},
		exit: {
			x: 2680,
			y: 460,
			w: 120,
			h: 168
		},
		intro: [
			"d.fin.1",
			"d.fin.2",
			"d.fin.3"
		],
		platforms: [
			ground(0, 960, "void"),
			plat(1040, 510, 190, "glitch"),
			plat(1320, 390, 170, "void"),
			plat(1600, 270, 190, "glitch"),
			ground(1920, 1080, "void")
		],
		hazards: [{
			x: 960,
			y: 680,
			w: 960,
			h: 50,
			kind: "pit"
		}],
		pickups: [],
		decor: [
			{
				x: 720,
				y: 20,
				sprite: "hang-yellow",
				sway: true,
				scale: 1.35,
				depth: 6
			},
			{
				x: 1480,
				y: -20,
				sprite: "hang-blue",
				sway: true,
				scale: 1.45,
				depth: 6
			},
			{
				x: 400,
				y: 400,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: 1.4
			},
			{
				x: 2200,
				y: 360,
				sprite: "eyes",
				follow: true,
				depth: 8,
				scale: 1.6
			}
		],
		checkpoints: [{
			x: 180,
			y: 500
		}],
		triggers: [{
			x: 2e3,
			y: 0,
			w: 60,
			h: H,
			event: "look",
			key: "d.fin.look",
			once: true
		}, {
			x: 2500,
			y: 0,
			w: 80,
			h: H,
			event: "ending",
			once: true
		}]
	}
];
function getLevel(id) {
	return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}
var COYOTE = 110;
var BUFFER = 130;
var JUMP_V = -860;
var GRAV_UP = 1750;
var GRAV_DOWN = 2750;
var APEX = 90;
var MAX_FALL = 980;
var ACCEL = 2700;
var AIR_ACCEL = 1750;
var FRICTION = 2400;
var MAX_SPEED = 310;
var CUT = .48;
var WALL_JUMP = -780;
var Pony = class {
	sprite;
	coyote = 0;
	buffer = 0;
	looking = false;
	hurtT = 0;
	dead = false;
	distorted = false;
	gravitySign = 1;
	locked = false;
	facing = 1;
	wasGrounded = false;
	idleMs = 0;
	canWallJump = false;
	onLand;
	onJump;
	onLook;
	constructor(scene, x, y) {
		this.sprite = scene.physics.add.sprite(x, y, "fs-idle", 0);
		this.sprite.setDepth(20);
		this.sprite.setSize(54, 40);
		this.sprite.setOffset(38, 72);
		this.sprite.setDisplaySize(112, 112);
		this.sprite.setMaxVelocity(MAX_SPEED, MAX_FALL);
		this.sprite.setCollideWorldBounds(false);
		const body = this.sprite.body;
		body.setDrag(0, 0);
		body.setAllowGravity(false);
	}
	setDistorted(v) {
		this.distorted = v;
	}
	lock(v) {
		this.locked = v;
		if (v) this.sprite.body.setVelocity(0, 0);
	}
	look(ms = 2200) {
		if (this.dead) return;
		this.looking = true;
		this.lock(true);
		this.sprite.play("fs-look-anim", true);
		this.onLook?.();
		this.sprite.scene.time.delayedCall(ms, () => {
			this.looking = false;
			this.lock(false);
		});
	}
	hurt() {
		if (this.hurtT > 0 || this.dead) return;
		this.hurtT = 420;
		this.sprite.play("fs-hurt-anim", true);
		this.sprite.setTint(16746632);
		this.sprite.scene.time.delayedCall(180, () => this.sprite.clearTint());
	}
	respawn(x, y) {
		this.dead = false;
		this.hurtT = 0;
		this.looking = false;
		this.locked = false;
		this.gravitySign = 1;
		this.idleMs = 0;
		this.sprite.setPosition(x, y);
		this.sprite.setVelocity(0, 0);
		this.sprite.setAlpha(1);
		this.sprite.clearTint();
		this.sprite.setFlipY(false);
	}
	grounded() {
		const body = this.sprite.body;
		return this.gravitySign > 0 ? body.blocked.down || body.touching.down : body.blocked.up || body.touching.up;
	}
	update(dt, actions) {
		const body = this.sprite.body;
		const ms = dt * 1e3;
		if (this.hurtT > 0) this.hurtT -= ms;
		if (this.locked || this.dead) {
			body.setVelocityX(0);
			return;
		}
		const onGround = this.grounded();
		if (onGround) this.coyote = COYOTE;
		else this.coyote = Math.max(0, this.coyote - ms);
		if (actions.jumpPressed) this.buffer = BUFFER;
		else this.buffer = Math.max(0, this.buffer - ms);
		const accel = onGround ? ACCEL : AIR_ACCEL;
		if (actions.moveX !== 0) {
			body.setVelocityX(__webpack_exports__Math.Clamp(body.velocity.x + actions.moveX * accel * dt, -310, MAX_SPEED));
			this.facing = actions.moveX > 0 ? 1 : -1;
			this.sprite.setFlipX(this.facing < 0);
		} else if (onGround) {
			const vx = body.velocity.x;
			const mag = Math.max(0, Math.abs(vx) - FRICTION * dt);
			body.setVelocityX(Math.sign(vx) * mag);
		}
		const canJump = this.coyote > 0;
		if (this.buffer > 0 && canJump) {
			body.setVelocityY(JUMP_V * this.gravitySign);
			this.coyote = 0;
			this.buffer = 0;
			this.onJump?.();
		} else if (this.canWallJump && this.buffer > 0 && !onGround) {
			const wallL = body.blocked.left || body.touching.left;
			const wallR = body.blocked.right || body.touching.right;
			if (wallL || wallR) {
				const dir = wallL ? 1 : -1;
				body.setVelocityY(WALL_JUMP * this.gravitySign);
				body.setVelocityX(dir * MAX_SPEED);
				this.facing = dir;
				this.sprite.setFlipX(this.facing < 0);
				this.buffer = 0;
				this.coyote = 0;
				this.onJump?.();
			}
		}
		if (!actions.jump && this.gravitySign * body.velocity.y < 0) body.setVelocityY(body.velocity.y * CUT);
		let g = GRAV_DOWN;
		if (this.gravitySign * body.velocity.y < 0) g = GRAV_UP;
		if (Math.abs(body.velocity.y) < APEX) g *= .55;
		body.setVelocityY(body.velocity.y + g * this.gravitySign * dt);
		if (this.gravitySign > 0 && body.velocity.y > MAX_FALL) body.setVelocityY(MAX_FALL);
		if (this.gravitySign < 0 && body.velocity.y < -980) body.setVelocityY(-980);
		if (onGround && !this.wasGrounded) this.onLand?.();
		this.wasGrounded = onGround;
		if (onGround && Math.abs(body.velocity.x) < 24 && !actions.jump) {
			this.idleMs += ms;
			if (this.idleMs > 7800) {
				this.idleMs = 0;
				this.look(2e3);
			}
		} else this.idleMs = 0;
		this.animate(onGround, body.velocity.x, body.velocity.y);
	}
	animate(onGround, vx, vy) {
		if (this.looking || this.hurtT > 0) return;
		const idle = this.distorted ? "fs-dist-anim" : "fs-idle-anim";
		const run = this.distorted ? "fs-dist-anim" : "fs-run-anim";
		if (!onGround) {
			const frame = this.gravitySign * vy < 0 ? 1 : 3;
			this.sprite.anims.stop();
			this.sprite.setTexture(this.distorted ? "fs-distorted" : "fs-jump", frame);
			return;
		}
		if (Math.abs(vx) > 40) this.sprite.play(run, true);
		else this.sprite.play(idle, true);
	}
};
var PlayScene = class extends __webpack_exports__Scene {
	pony;
	level;
	solids;
	oneWays;
	moversGroup;
	hazards;
	pickups;
	exitZone;
	fired = /* @__PURE__ */ new Set();
	spawn = {
		x: 140,
		y: 500
	};
	dropThrough = 0;
	distortOn = false;
	flicker = [];
	fog;
	pausedLogic = false;
	watchers = [];
	movers = [];
	dust;
	motes;
	lastDeathTalk = -1;
	ambientLookAt = 0;
	constructor() {
		super("play");
	}
	init(data) {
		this.fired = /* @__PURE__ */ new Set();
		this.dropThrough = 0;
		this.distortOn = false;
		this.flicker = [];
		this.watchers = [];
		this.movers = [];
		this.pausedLogic = false;
		this.lastDeathTalk = -1;
		this.ambientLookAt = 0;
		const id = data.level ?? this.registry.get("startLevel") ?? 1;
		this.level = getLevel(id);
		this.spawn = { ...this.level.spawn };
		this.registry.set("startLevel", this.level.id);
	}
	create() {
		const L = this.level;
		this.physics.world.setBounds(0, 0, L.width, 900);
		this.cameras.main.setBounds(0, 0, L.width, L.height);
		this.cameras.main.setDeadzone(180, 90);
		this.cameras.main.roundPixels = true;
		this.add.image(0, 0, this.texKey(L.sky)).setOrigin(0, 0).setScrollFactor(.08).setDepth(-20).setDisplaySize(Math.max(L.width, 1800), L.height);
		this.add.image(0, 20, this.texKey(L.far)).setOrigin(0, 0).setScrollFactor(.32).setDepth(-15).setDisplaySize(Math.max(L.width * .75, 1600), L.height * .98);
		if (L.fog) {
			this.fog = this.add.image(0, 0, this.texKey(L.fog)).setOrigin(0, 0).setScrollFactor(0).setDepth(40);
			this.fog.setDisplaySize(1280, 720);
			this.fog.setAlpha(.72);
		}
		this.solids = this.physics.add.staticGroup();
		this.oneWays = this.physics.add.staticGroup();
		this.moversGroup = this.physics.add.group({
			allowGravity: false,
			immovable: true
		});
		this.hazards = this.physics.add.staticGroup();
		this.pickups = this.physics.add.group({ allowGravity: false });
		L.platforms.forEach((p) => this.spawnPlat(p));
		L.hazards.forEach((h) => {
			if (h.kind === "pit") return;
			const key = h.kind === "spikes" ? "spikes" : "puddle";
			const s = this.add.tileSprite(h.x, h.y, h.w, h.h, key).setOrigin(0, 0).setDepth(8);
			this.physics.add.existing(s, true);
			s.setData("kind", h.kind);
			this.hazards.add(s);
		});
		L.pickups.forEach((c) => {
			if (useGameStore.getState().notes.includes(c.id) && c.kind === "note") return;
			const key = c.kind === "butterfly" ? "butterflies" : c.kind === "note" ? "note" : "flower";
			const spr = this.pickups.create(c.x, c.y, key);
			spr.setOrigin(.5, 1);
			spr.setData("kind", c.kind);
			spr.setData("id", c.id);
			spr.setDepth(12);
			if (c.kind === "butterfly") {
				spr.play("bfly-anim");
				spr.setDisplaySize(48, 48);
			} else if (c.kind === "note") spr.setDisplaySize(36, 42);
			else spr.setDisplaySize(40, 48);
			this.tweens.add({
				targets: spr,
				y: c.y - 10,
				duration: 900,
				yoyo: true,
				repeat: -1,
				ease: "Sine.easeInOut"
			});
		});
		L.decor.forEach((d) => {
			const img = this.add.image(d.x, d.y, d.sprite).setOrigin(.5, 1).setDepth(d.depth ?? 6);
			if (d.scale) img.setScale(d.scale);
			if (d.flip) img.setFlipX(true);
			if (d.alpha != null) img.setAlpha(d.alpha);
			if (d.sprite === "eyes") img.setOrigin(.5, .5);
			if (d.sprite === "hang-yellow" || d.sprite.startsWith("hang-")) img.setOrigin(.5, 0);
			if (d.sway) this.tweens.add({
				targets: img,
				angle: {
					from: -5,
					to: 5
				},
				duration: 1600 + Math.random() * 900,
				yoyo: true,
				repeat: -1,
				ease: "Sine.easeInOut"
			});
			if (d.follow) this.watchers.push(img);
		});
		L.checkpoints.forEach((c) => {
			this.add.image(c.x, c.y + 80, "flag").setOrigin(.5, 1).setDepth(5).setDisplaySize(28, 44);
		});
		this.add.image(L.exit.x + L.exit.w / 2, L.exit.y + L.exit.h, "door").setOrigin(.5, 1).setDepth(9).setDisplaySize(L.exit.w, L.exit.h);
		this.exitZone = this.add.zone(L.exit.x, L.exit.y, L.exit.w, L.exit.h).setOrigin(0, 0);
		this.physics.add.existing(this.exitZone, true);
		this.add.tileSprite(0, L.height - 36, L.width, 64, "fg-grass").setOrigin(0, 1).setScrollFactor(1.12).setDepth(28).setAlpha(L.id === 1 ? .85 : L.id === 2 ? .55 : .25);
		this.add.image(640, 360, "vignette").setScrollFactor(0).setDepth(45).setAlpha(L.id >= 3 ? .85 : .55);
		this.pony = new Pony(this, L.spawn.x, L.spawn.y);
		this.pony.canWallJump = L.id >= 4;
		this.pony.onJump = () => playSfx("jump");
		this.pony.onLand = () => {
			playSfx("land");
			this.dust?.explode(7, this.pony.sprite.x, this.pony.sprite.y + 28);
		};
		this.pony.onLook = () => {
			hushMusic(1.6);
			playSfx("whisper");
		};
		this.cameras.main.startFollow(this.pony.sprite, true, .14, .1);
		this.cameras.main.setFollowOffset(-80, 40);
		this.physics.add.collider(this.pony.sprite, this.solids);
		this.physics.add.collider(this.pony.sprite, this.moversGroup);
		this.physics.add.collider(this.pony.sprite, this.oneWays, void 0, (_p, plat) => {
			if (this.dropThrough > 0) return false;
			const pb = this.pony.sprite.body;
			const tb = plat.body;
			return pb.velocity.y >= 0 && pb.bottom <= tb.top + 14;
		});
		this.physics.add.overlap(this.pony.sprite, this.pickups, (_p, item) => {
			const s = item;
			const kind = s.getData("kind");
			const id = s.getData("id");
			s.destroy();
			playSfx("collect");
			if (kind === "note") bridge.emit({
				type: "note",
				id
			});
			else bridge.emit({
				type: "collect",
				kind: kind === "flower" ? "flower" : "butterfly"
			});
		});
		this.physics.add.overlap(this.pony.sprite, this.hazards, () => this.kill());
		this.physics.add.overlap(this.pony.sprite, this.exitZone, () => this.clearLevel());
		this.dust = this.add.particles(0, 0, "px", {
			lifespan: 420,
			speedY: {
				min: -40,
				max: -8
			},
			speedX: {
				min: -50,
				max: 50
			},
			scale: {
				start: 1.6,
				end: .2
			},
			alpha: {
				start: .45,
				end: 0
			},
			emitting: false,
			tint: L.id >= 3 ? 6952984 : 13153418
		});
		this.dust.setDepth(18);
		const tint = L.id >= 6 ? 8921770 : L.id >= 3 ? 10101808 : L.id === 2 ? 12109e3 : 16769162;
		this.motes = this.add.particles(0, 0, "px", {
			x: {
				min: 0,
				max: 1280
			},
			y: {
				min: 0,
				max: 720
			},
			lifespan: 5e3,
			speedY: {
				min: L.id >= 3 ? 20 : -18,
				max: L.id >= 3 ? 70 : 10
			},
			scale: {
				start: 1.4,
				end: .2
			},
			alpha: {
				start: .28,
				end: 0
			},
			quantity: 1,
			frequency: L.id >= 4 ? 70 : 180,
			tint,
			blendMode: L.id >= 4 ? "ADD" : "NORMAL"
		});
		this.motes.setScrollFactor(0).setDepth(36);
		if (L.id === 1) for (let i = 0; i < 5; i++) {
			const b = this.add.sprite(200 + i * 700, 180 + i % 3 * 40, "butterflies", 0).setDepth(11);
			b.play("bfly-anim");
			b.setDisplaySize(36, 36);
			b.setScrollFactor(.55);
			this.tweens.add({
				targets: b,
				x: b.x + 160,
				y: b.y - 20,
				duration: 4200 + i * 400,
				yoyo: true,
				repeat: -1,
				ease: "Sine.easeInOut"
			});
		}
		installControlsTest(() => this.pony);
		setMusicBed(L.id);
		useGameStore.getState().setLevel(L.id);
		if (L.intro.length && !this.fired.has("intro")) {
			const tryIntro = () => {
				if (!useGameStore.getState().sessionStarted) {
					this.time.delayedCall(200, tryIntro);
					return;
				}
				this.fired.add("intro");
				useGameStore.getState().queueDialogue(L.intro.map((key) => ({
					key,
					speaker: "fs"
				})));
			};
			this.time.delayedCall(400, tryIntro);
		}
		this.events.once("shutdown", () => {
			this.tweens.killAll();
		});
	}
	texKey(path) {
		return (path.split("/").pop() ?? path).replace(/\.(jpg|png)$/, "");
	}
	spawnPlat(p) {
		const key = `plat-${p.tex}`;
		const tile = this.add.tileSprite(p.x, p.y, p.w, p.h, key).setOrigin(0, 0).setDepth(4);
		if (p.move) {
			this.physics.add.existing(tile, false);
			const body = tile.body;
			body.setAllowGravity(false);
			body.setImmovable(true);
			body.setSize(p.w, p.h);
			this.moversGroup.add(tile);
			this.movers.push({
				spr: tile,
				body,
				ox: p.x,
				oy: p.y,
				dx: p.move.dx,
				dy: p.move.dy,
				period: p.move.period / 1e3,
				t: 0
			});
			return;
		}
		this.physics.add.existing(tile, true);
		tile.body.updateFromGameObject();
		if (p.oneWay) this.oneWays.add(tile);
		else this.solids.add(tile);
		if (this.level.id === 4 && p.oneWay) this.flicker.push(tile);
	}
	kill() {
		if (this.pony.dead || this.pausedLogic) return;
		this.pony.dead = true;
		this.pony.hurt();
		playSfx("hurt");
		this.cameras.main.shake(180, .006);
		bridge.emit({ type: "died" });
		const deaths = useGameStore.getState().deaths;
		if (deaths === 1 || deaths % 4 === 0) {
			this.lastDeathTalk = deaths;
			this.time.delayedCall(280, () => bridge.emit({
				type: "dialogue",
				key: "d.death"
			}));
		}
		this.time.delayedCall(520, () => {
			this.pony.respawn(this.spawn.x, this.spawn.y);
			this.cameras.main.flash(200, 20, 0, 0);
		});
	}
	clearLevel() {
		if (this.pausedLogic) return;
		this.pausedLogic = true;
		if (this.level.id >= 7) {
			bridge.emit({ type: "ending" });
			return;
		}
		bridge.emit({
			type: "level-clear",
			level: this.level.id
		});
		this.cameras.main.fade(500, 0, 0, 0);
		this.time.delayedCall(520, () => {
			this.scene.restart({ level: this.level.id + 1 });
		});
	}
	fireTrigger(t, idx) {
		const id = `t${idx}`;
		if (t.once && this.fired.has(id)) return;
		const r = this.pony.sprite.getBounds();
		if (r.centerX < t.x || r.centerX > t.x + t.w) return;
		this.fired.add(id);
		switch (t.event) {
			case "dialogue":
				if (t.key) bridge.emit({
					type: "dialogue",
					key: t.key
				});
				break;
			case "look":
				this.pony.look(2400);
				hushMusic(2);
				playSfx("whisper");
				if (t.key) bridge.emit({
					type: "dialogue",
					key: t.key,
					look: true
				});
				bridge.emit({
					type: "overlay",
					kind: "look",
					ms: 1800
				});
				break;
			case "red":
				playSfx("stinger");
				this.cameras.main.shake(200, .01);
				bridge.emit({
					type: "overlay",
					kind: "red",
					textKey: t.key,
					ms: 1600
				});
				break;
			case "bsod":
				this.pausedLogic = true;
				this.physics.pause();
				playSfx("stinger");
				bridge.emit({
					type: "overlay",
					kind: "bsod",
					textKey: "bsod.body",
					ms: 4200
				});
				this.time.delayedCall(4200, () => {
					this.physics.resume();
					this.pausedLogic = false;
					bridge.emit({
						type: "dialogue",
						key: "d.l4.after"
					});
				});
				break;
			case "freeze":
				this.pausedLogic = true;
				this.physics.pause();
				playSfx("stinger");
				bridge.emit({
					type: "overlay",
					kind: "freeze",
					textKey: "freeze.body",
					ms: 7e3
				});
				this.time.delayedCall(5200, () => {
					this.physics.resume();
					this.pausedLogic = false;
				});
				break;
			case "black":
				this.pausedLogic = true;
				this.physics.pause();
				hushMusic(3);
				bridge.emit({
					type: "overlay",
					kind: "black",
					textKey: t.key ?? "black.1",
					ms: 3800
				});
				this.time.delayedCall(3800, () => {
					this.physics.resume();
					this.pausedLogic = false;
				});
				break;
			case "glitch":
				playSfx("stinger");
				this.cameras.main.shake(500, .012);
				bridge.emit({
					type: "overlay",
					kind: "glitch",
					ms: 1400
				});
				bridge.emit({ type: "shake-window" });
				break;
			case "whisper":
				playSfx("whisper");
				if (t.key) bridge.emit({
					type: "whisper",
					key: t.key
				});
				break;
			case "shake":
				bridge.emit({ type: "shake-window" });
				this.cameras.main.shake(400, .008);
				break;
			case "notepad":
				bridge.emit({
					type: "overlay",
					kind: "notepad",
					textKey: t.key ?? "notepad.1",
					ms: 3200
				});
				break;
			case "windows":
				bridge.emit({
					type: "overlay",
					kind: "windows",
					ms: 4e3
				});
				break;
			case "cursor":
				bridge.emit({ type: "cursor-flee" });
				break;
			case "desktop-pony":
				bridge.emit({ type: "desktop-pony" });
				break;
			case "gravity":
				this.pony.gravitySign = -1;
				this.pony.sprite.setFlipY(true);
				this.time.delayedCall(2800, () => {
					this.pony.gravitySign = 1;
					this.pony.sprite.setFlipY(false);
				});
				break;
			case "distort":
				this.distortOn = true;
				this.pony.setDistorted(true);
				this.cameras.main.shake(400, .008);
				playSfx("whisper");
				break;
			case "ending": bridge.emit({ type: "ending" });
		}
	}
	update(_time, delta) {
		const dt = Math.min(delta, 50) / 1e3;
		const store = useGameStore.getState();
		if (!store.sessionStarted) {
			this.pony.lock(true);
			return;
		}
		if (store.dialogue) {
			this.pony.lock(true);
			const actions = readActions();
			if (actions.jumpPressed || actions.pause) store.advanceDialogue(true);
			return;
		}
		if (store.phase === "paused" || store.overlay.kind === "bsod" || store.overlay.kind === "freeze" || store.overlay.kind === "black") {
			this.pony.lock(true);
			return;
		}
		this.pony.lock(false);
		const actions = readActions();
		if (actions.pause) {
			bridge.emit({ type: "pause-request" });
			return;
		}
		if (actions.down && actions.jumpPressed) this.dropThrough = 220;
		if (this.dropThrough > 0) this.dropThrough -= delta;
		if (!this.pausedLogic) this.pony.update(dt, actions);
		if (this.pony.sprite.y > 820) this.kill();
		this.level.checkpoints.forEach((c) => {
			if (Math.abs(this.pony.sprite.x - c.x) < 48 && this.pony.grounded()) this.spawn = {
				x: c.x,
				y: c.y
			};
		});
		this.level.triggers.forEach((t, i) => this.fireTrigger(t, i));
		this.flicker.forEach((p, i) => {
			const on = Math.sin(_time / 180 + i) > -.65;
			p.setAlpha(on ? 1 : .15);
			p.body.enable = on;
		});
		this.movers.forEach((m) => {
			m.t += dt;
			const u = (Math.sin(m.t / m.period * Math.PI * 2) + 1) / 2;
			const nx = m.ox + m.dx * u;
			const ny = m.oy + m.dy * u;
			const vx = (nx - m.spr.x) / Math.max(dt, .001);
			const vy = (ny - m.spr.y) / Math.max(dt, .001);
			m.body.setVelocity(vx, vy);
			m.spr.x = nx;
			m.spr.y = ny;
		});
		if (this.fog) this.fog.setAlpha(.55 + Math.sin(_time / 1400) * .12);
		const px = this.pony.sprite.x;
		this.watchers.forEach((w) => {
			w.setFlipX(px < w.x);
			w.setAlpha(.55 + Math.sin(_time / 500 + w.x) * .35);
		});
		if (this.level.id >= 2) {
			this.ambientLookAt += delta;
			if (this.ambientLookAt > 22e3 && this.pony.grounded() && !this.pony.looking) {
				this.ambientLookAt = 0;
				this.pony.look(1600);
				bridge.emit({
					type: "whisper",
					key: this.level.id >= 5 ? "whisper.2" : "whisper.1"
				});
			}
		}
		if (this.level.id >= 4 && Math.random() < .004) this.cameras.main.shake(80, .002);
		this.cameras.main.setFollowOffset(this.pony.facing > 0 ? -90 : 90, 36);
	}
};
var PreloadScene = class extends __webpack_exports__Scene {
	constructor() {
		super("preload");
	}
	preload() {
		const w = this.scale.width;
		const h = this.scale.height;
		this.add.rectangle(0, 0, w, h, 460554).setOrigin(0);
		this.add.text(w / 2, h / 2 - 48, "WAITING", {
			fontFamily: "Cormorant Garamond, serif",
			fontSize: "48px",
			color: "#efe6d6"
		}).setOrigin(.5);
		this.add.text(w / 2, h / 2 - 8, "she found a game about herself", {
			fontFamily: "IBM Plex Sans, sans-serif",
			fontSize: "14px",
			color: "#9a9388"
		}).setOrigin(.5);
		this.add.rectangle(w / 2, h / 2 + 36, 420, 8, 2763314).setOrigin(.5);
		const bar = this.add.rectangle(w / 2 - 210, h / 2 + 36, 4, 8, 8308937).setOrigin(0, .5);
		this.load.on("progress", (v) => {
			bar.width = 420 * v;
		});
		[
			[
				"fs-idle",
				"/sprites/fs-idle.png",
				128,
				128
			],
			[
				"fs-run",
				"/sprites/fs-run.png",
				128,
				128
			],
			[
				"fs-jump",
				"/sprites/fs-jump.png",
				128,
				128
			],
			[
				"fs-look",
				"/sprites/fs-look.png",
				128,
				128
			],
			[
				"fs-hurt",
				"/sprites/fs-hurt.png",
				128,
				128
			],
			[
				"fs-distorted",
				"/sprites/fs-distorted.png",
				128,
				128
			],
			[
				"butterflies",
				"/sprites/butterflies.png",
				64,
				64
			]
		].forEach(([k, u, fw, fh]) => this.load.spritesheet(k, u, {
			frameWidth: fw,
			frameHeight: fh
		}));
		[
			"fs-portrait",
			"fs-horror",
			"note",
			"flower",
			"door",
			"eyes",
			"spikes",
			"puddle",
			"flag",
			"plat-grass",
			"plat-wood",
			"plat-stone",
			"plat-blood",
			"plat-glitch",
			"plat-void",
			"hang-yellow",
			"hang-blue",
			"hang-purple",
			"hang-pink",
			"hang-white",
			"hang-orange",
			"tree-1",
			"tree-2",
			"bush",
			"grass",
			"rock",
			"mushroom",
			"drip",
			"vine",
			"vignette",
			"px",
			"fg-grass"
		].forEach((k) => this.load.image(k, `/sprites/${k}.png`));
		const pngMaps = /* @__PURE__ */ new Set(["fog-overlay", "blood-fog"]);
		[
			"forest-sky",
			"forest-far",
			"fog-sky",
			"fog-far",
			"fog-overlay",
			"blood-sky",
			"blood-far",
			"blood-fog",
			"void-sky",
			"void-far",
			"glitch-far",
			"finale-sky",
			"desktop-corrupt",
			"desktop-wallpaper"
		].forEach((k) => {
			this.load.image(k, `/maps/${k}.${pngMaps.has(k) ? "png" : "jpg"}`);
		});
	}
	create() {
		const mk = (key, tex, end, rate, repeat) => {
			if (this.anims.exists(key)) return;
			this.anims.create({
				key,
				frames: this.anims.generateFrameNumbers(tex, {
					start: 0,
					end
				}),
				frameRate: rate,
				repeat
			});
		};
		mk("fs-idle-anim", "fs-idle", 3, 5, -1);
		mk("fs-run-anim", "fs-run", 5, 11, -1);
		mk("fs-jump-anim", "fs-jump", 3, 8, 0);
		mk("fs-look-anim", "fs-look", 3, 4, 0);
		mk("fs-hurt-anim", "fs-hurt", 3, 8, 0);
		mk("fs-dist-anim", "fs-distorted", 3, 5, -1);
		mk("bfly-anim", "butterflies", 3, 8, -1);
		bridge.emit({ type: "loaded" });
		const level = this.registry.get("startLevel") || 1;
		this.scene.start("play", { level });
	}
};
function createWaitingGame(parent, startLevel = 1) {
	const game = new __webpack_exports__Game({
		type: __webpack_exports__AUTO,
		parent,
		width: 1280,
		height: 720,
		backgroundColor: "#0b1210",
		pixelArt: false,
		roundPixels: true,
		physics: {
			default: "arcade",
			arcade: {
				gravity: {
					x: 0,
					y: 0
				},
				debug: false
			}
		},
		scale: {
			mode: __webpack_exports__Scale.FIT,
			autoCenter: __webpack_exports__Scale.CENTER_BOTH,
			width: 1280,
			height: 720
		},
		render: { antialias: true },
		audio: { disableWebAudio: true },
		scene: [
			BootScene,
			PreloadScene,
			PlayScene
		]
	});
	game.registry.set("startLevel", startLevel);
	return game;
}
//#endregion
export { createWaitingGame };
