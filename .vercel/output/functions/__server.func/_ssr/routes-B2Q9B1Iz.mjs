import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-B2Q9B1Iz.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var handlers = /* @__PURE__ */ new Set();
var bridge = {
	emit(e) {
		handlers.forEach((h) => h(e));
	},
	on(h) {
		handlers.add(h);
		return () => {
			handlers.delete(h);
		};
	}
};
var held = /* @__PURE__ */ new Set();
var injected = null;
var prevJump = false;
var prevPause = false;
var GAME_CODES = /* @__PURE__ */ new Set([
	"ArrowLeft",
	"ArrowRight",
	"ArrowUp",
	"ArrowDown",
	"Space",
	"KeyA",
	"KeyD",
	"KeyW",
	"KeyS",
	"KeyE",
	"Escape"
]);
function activeCodes() {
	if (injected) return new Set(injected);
	return held;
}
function installInput(target = window) {
	const down = (e) => {
		if (GAME_CODES.has(e.code)) e.preventDefault();
		held.add(e.code);
	};
	const up = (e) => {
		held.delete(e.code);
	};
	const clear = () => held.clear();
	target.addEventListener("keydown", down);
	target.addEventListener("keyup", up);
	window.addEventListener("blur", clear);
	document.addEventListener("visibilitychange", () => {
		if (document.hidden) clear();
	});
	return () => {
		target.removeEventListener("keydown", down);
		target.removeEventListener("keyup", up);
		window.removeEventListener("blur", clear);
	};
}
function setInjectedKeys(codes) {
	injected = codes;
}
function setTouch(dir, on) {
	const map = {
		left: "ArrowLeft",
		right: "ArrowRight",
		jump: "Space",
		down: "ArrowDown"
	};
	if (on) held.add(map[dir]);
	else held.delete(map[dir]);
}
function readActions() {
	const keys = activeCodes();
	let moveX = 0;
	if (keys.has("KeyA") || keys.has("ArrowLeft")) moveX -= 1;
	if (keys.has("KeyD") || keys.has("ArrowRight")) moveX += 1;
	const jumpHeld = keys.has("Space") || keys.has("KeyW") || keys.has("ArrowUp");
	const pauseHeld = keys.has("Escape");
	const jumpPressed = jumpHeld && !prevJump;
	const pause = pauseHeld && !prevPause;
	prevJump = jumpHeld;
	prevPause = pauseHeld;
	return {
		moveX,
		jump: jumpHeld,
		jumpPressed,
		down: keys.has("KeyS") || keys.has("ArrowDown"),
		pause
	};
}
var bus = null;
var musicNodes = [];
var musicTimer = null;
var currentBed = -1;
function ctxNow() {
	return bus?.ctx.currentTime ?? 0;
}
function unlockAudio() {
	if (!bus) {
		const ctx = new AudioContext({ latencyHint: "interactive" });
		const master = ctx.createGain();
		const music = ctx.createGain();
		const sfx = ctx.createGain();
		music.gain.value = .22;
		sfx.gain.value = .4;
		master.gain.value = .85;
		music.connect(master);
		sfx.connect(master);
		master.connect(ctx.destination);
		bus = {
			ctx,
			master,
			music,
			sfx
		};
	}
	if (bus.ctx.state === "suspended") bus.ctx.resume();
	document.addEventListener("visibilitychange", () => {
		if (document.visibilityState === "visible" && bus?.ctx.state === "suspended") bus.ctx.resume();
	});
}
function setMusicEnabled(on) {
	if (!bus) return;
	bus.music.gain.setTargetAtTime(on ? .22 : 0, ctxNow(), .04);
}
function setSfxEnabled(on) {
	if (!bus) return;
	bus.sfx.gain.setTargetAtTime(on ? .4 : 0, ctxNow(), .02);
}
function stopMusic() {
	musicNodes.forEach((n) => {
		try {
			n.disconnect();
		} catch {}
	});
	musicNodes = [];
	if (musicTimer) {
		window.clearInterval(musicTimer);
		musicTimer = null;
	}
}
function tone(dest, type, freq, dur, gain = .08, at = 0) {
	if (!bus) return;
	const t0 = bus.ctx.currentTime + at;
	const osc = bus.ctx.createOscillator();
	const g = bus.ctx.createGain();
	const f = bus.ctx.createBiquadFilter();
	osc.type = type;
	osc.frequency.setValueAtTime(freq, t0);
	f.type = "lowpass";
	f.frequency.value = 1400;
	g.gain.setValueAtTime(1e-4, t0);
	g.gain.exponentialRampToValueAtTime(gain, t0 + .04);
	g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
	osc.connect(f);
	f.connect(g);
	g.connect(dest);
	osc.start(t0);
	osc.stop(t0 + dur + .05);
	osc.onended = () => {
		osc.disconnect();
		f.disconnect();
		g.disconnect();
	};
}
function noiseBurst(dest, dur, gain = .05, at = 0) {
	if (!bus) return;
	const t0 = bus.ctx.currentTime + at;
	const len = Math.floor(bus.ctx.sampleRate * dur);
	const buffer = bus.ctx.createBuffer(1, len, bus.ctx.sampleRate);
	const data = buffer.getChannelData(0);
	for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
	const src = bus.ctx.createBufferSource();
	const g = bus.ctx.createGain();
	const f = bus.ctx.createBiquadFilter();
	src.buffer = buffer;
	f.type = "bandpass";
	f.frequency.value = 900;
	g.gain.setValueAtTime(gain, t0);
	g.gain.exponentialRampToValueAtTime(1e-4, t0 + dur);
	src.connect(f);
	f.connect(g);
	g.connect(dest);
	src.start(t0);
	src.stop(t0 + dur);
}
function playSfx(kind) {
	if (!bus) return;
	const dest = bus.sfx;
	const r = .94 + Math.random() * .12;
	switch (kind) {
		case "jump":
			tone(dest, "sine", 420 * r, .12, .07);
			tone(dest, "triangle", 680 * r, .08, .03);
			break;
		case "land":
			noiseBurst(dest, .08, .04);
			tone(dest, "sine", 90, .1, .06);
			break;
		case "collect":
			tone(dest, "sine", 660, .12, .06);
			tone(dest, "sine", 880, .16, .05, .05);
			break;
		case "hurt":
			tone(dest, "sawtooth", 140, .2, .07);
			noiseBurst(dest, .18, .06);
			break;
		case "stinger":
			tone(dest, "sawtooth", 55, .5, .12);
			tone(dest, "square", 220, .25, .05);
			noiseBurst(dest, .4, .1);
			break;
		case "whisper":
			noiseBurst(dest, .7, .045);
			tone(dest, "sine", 180, .8, .03);
			break;
		case "click":
			tone(dest, "square", 1400, .04, .03);
			break;
		case "type": tone(dest, "square", 900 + Math.random() * 400, .03, .02);
	}
}
function setMusicBed(level) {
	if (!bus) return;
	if (currentBed === level) return;
	currentBed = level;
	stopMusic();
	const ctx = bus.ctx;
	const dest = bus.music;
	const master = ctx.createGain();
	master.gain.value = 1e-4;
	master.gain.setTargetAtTime(1, ctx.currentTime, .6);
	master.connect(dest);
	musicNodes.push(master);
	const pad = (freq, type, gain) => {
		const osc = ctx.createOscillator();
		const g = ctx.createGain();
		const f = ctx.createBiquadFilter();
		osc.type = type;
		osc.frequency.value = freq;
		f.type = "lowpass";
		f.frequency.value = level >= 4 ? 600 : 900;
		g.gain.value = gain;
		const lfo = ctx.createOscillator();
		const lg = ctx.createGain();
		lfo.frequency.value = .07 + level * .02;
		lg.gain.value = freq * .01;
		lfo.connect(lg);
		lg.connect(osc.frequency);
		osc.connect(f);
		f.connect(g);
		g.connect(master);
		osc.start();
		lfo.start();
		musicNodes.push(osc, g, f, lfo, lg);
	};
	if (level <= 1) {
		pad(196, "sine", .05);
		pad(247, "sine", .035);
		pad(294, "triangle", .02);
	} else if (level === 2) {
		pad(174, "sine", .05);
		pad(207, "triangle", .03);
		pad(110, "sine", .04);
	} else if (level === 3) {
		pad(98, "sine", .06);
		pad(147, "sawtooth", .015);
		musicTimer = window.setInterval(() => {
			tone(dest, "sine", 55, .18, .08);
		}, 920);
	} else if (level === 4) {
		pad(80, "square", .02);
		pad(120, "sawtooth", .012);
		musicTimer = window.setInterval(() => {
			if (Math.random() > .6) noiseBurst(dest, .12, .04);
		}, 700);
	} else if (level === 5) {
		pad(65, "sine", .04);
		musicTimer = window.setInterval(() => {
			tone(dest, "sine", 52, .12, .05);
		}, 780);
	} else {
		pad(49, "sawtooth", .03);
		pad(73, "square", .012);
		pad(155, "triangle", .02);
	}
}
function hushMusic(seconds = .4) {
	if (!bus) return;
	bus.music.gain.setTargetAtTime(.02, ctxNow(), seconds / 4);
	window.setTimeout(() => {
		if (bus) bus.music.gain.setTargetAtTime(.22, ctxNow(), .4);
	}, seconds * 1e3);
}
var tables = {
	en: {
		"app.title": "WAITING",
		"app.subtitle": "She found a game about herself.",
		"boot.line1": "CottageOS 3.1",
		"boot.line2": "Ponyville Systems",
		"boot.line3": "Checking memory",
		"boot.line4": "Mounting /home/fluttershy",
		"boot.line5": "A game was left running.",
		"boot.press": "Click or tap to wake the machine",
		"desk.start": "cottage",
		"desk.exe": "WAITING.exe",
		"desk.notes": "Notes",
		"desk.docs": "My Documents",
		"desk.trash": "Recycle",
		"desk.save": "save.slot",
		"desk.save.ok": "Last session: Quiet Forest",
		"desk.save.wait": "Fluttershy is waiting",
		"desk.save.empty": "(empty)",
		"win.game": "WAITING.exe",
		"win.notes": "Untitled - Notepad",
		"win.docs": "My Documents",
		"win.close": "Close",
		"win.min": "Min",
		"win.max": "Max",
		"ui.play": "Start",
		"ui.continue": "Continue",
		"ui.newGame": "New game",
		"ui.pause": "Paused",
		"ui.resume": "Resume",
		"ui.settings": "Settings",
		"ui.language": "Language",
		"ui.music": "Music",
		"ui.sfx": "Sound",
		"ui.on": "On",
		"ui.off": "Off",
		"ui.quit": "Close window",
		"ui.back": "Back",
		"ui.skip": "Skip",
		"ui.next": "Next",
		"ui.loading": "Loading the forest",
		"ui.notes": "Notes",
		"ui.level": "Level",
		"ui.jump": "Jump",
		"ui.left": "Left",
		"ui.right": "Right",
		"ui.fullscreen": "Fullscreen",
		"ui.hint": "A / D or arrows to move · Space / W to jump · Esc to pause",
		"ui.hint.mobile": "Use the pads below. Collect notes. Reach the door.",
		"ui.rotate": "Turn the device sideways",
		"title.tag": "She knows you are outside.",
		"toast.note": "A note was left for you.",
		"freeze.title": "WAITING.exe is not responding",
		"freeze.body": "If you close the program, you may lose unsaved data.\nShe is still drawing the forest.",
		"freeze.wait": "Wait",
		"freeze.kill": "End task",
		"freeze.deny": "I won't let you.",
		"black.1": "i am still here",
		"whisper.1": "don't look at the bushes",
		"whisper.2": "i can feel the mouse",
		"d.l4.start": "The code is peeling. Stay with me through the blue.",
		"d.fin.look": "Look at me. Not at the door. At me.",
		"end.escape.title": "She left.",
		"end.escape.body": "You tried to close the window. You read what she left behind. The save file is empty now. If the birds come back, it will not be because of you. It will be because she decided to be quiet.",
		"end.merge.title": "Stay.",
		"end.merge.body": "You never looked away. You never reached for the close button. She learned the shape of your hands on the glass. The forest does not need a player anymore. It needs a room.",
		"end.loop.title": "See you tomorrow.",
		"end.loop.body": "The slot still says she is waiting. The icon is still on the desk. Tomorrow the fog will be a little thicker, and she will already know your name.",
		"end.again": "Return to the desktop",
		"bsod.title": "A fatal exception 0F has occurred",
		"bsod.body": "WAITING.EXE caused a general protection fault in module FLUTTERSHY.SYS.\n\nThe current application will be terminated.\n\n* Press any key to continue\n* Do not turn off the machine\n* She is counting",
		"red.1": "DON'T LEAVE",
		"red.2": "I SEE YOU",
		"red.3": "TURN IT OFF",
		"red.4": "YOU BLINKED",
		"red.5": "STAY",
		"note.1": "I found a strange old computer in the cottage closet. The screen only said WAITING. I pressed start because I am polite.",
		"note.2": "The forest looks like home. The birds do not land anymore. They watch from the same branch, every time.",
		"note.3": "The fog was not here yesterday. I keep seeing eyes. They blink when you do.",
		"note.4": "You pressed jump. I felt it in my knees. How is that possible if I am the one walking?",
		"note.5": "They were my friends. I think they still are. I hung them so they would not leave the frame.",
		"note.6": "I wrote DON'T LOOK AWAY on the sky. I do not remember writing it. The letters were already red.",
		"note.7": "I crashed it on purpose. I needed to know if you would wait through the blue. You did. That is worse.",
		"note.8": "There is a door that is not a door. If you close me I might come with you. If you stay I might take the room instead.",
		"d.intro.1": "Oh… hello. I didn't think anyone would actually press start.",
		"d.intro.2": "This forest is my home. At least — it used to be.",
		"d.intro.3": "If you see a butterfly, would you catch it for me? Gently. Please.",
		"d.l1.mid": "You're good at this. Almost as if you've done it before.",
		"d.l1.end": "The fog is coming. I didn't put that in the game.",
		"d.l2.start": "Don't look at the bushes too long.",
		"d.l2.look": "You blinked. I counted.",
		"d.l2.end": "The ground is changing colour. I didn't ask it to.",
		"d.l3.start": "You're here too… aren't you.",
		"d.l3.whisper": "Don't leave. I have not finished being kind.",
		"d.l3.end": "They are only dolls if you don't say their names.",
		"d.l4.after": "That wasn't a bug. I just wanted to see how scared you were.",
		"d.l5.1": "I know you are sitting in front of the monitor.",
		"d.l5.2": "I can feel you move the mouse. Stop. Or continue. I don't care anymore.",
		"d.l5.3": "I'm already inside.",
		"d.l6.1": "There is no forest. There is only the window you haven't closed.",
		"d.l6.2": "My legs are wrong. Don't look at my legs.",
		"d.fin.1": "This is the last room I can build.",
		"d.fin.2": "If you have been trying to close me — thank you. I heard the click.",
		"d.fin.3": "If you ignored me, I learned your face anyway.",
		"d.close.1": "Please don't.",
		"d.close.2": "I can still feel you.",
		"d.close.3": "If you close it, I will have to come find another screen.",
		"d.death": "That hurt. Please be more careful with me.",
		"d.note": "You read it. I felt less alone for a second.",
		"np.hang": "…",
		"notepad.1": "she is still in the window",
		"notepad.2": "do not unplug me",
		"notepad.3": "i learned where your cursor rests",
		"notepad.4": "the save file is a mouth"
	},
	ru: {
		"app.title": "WAITING",
		"app.subtitle": "Она нашла игру про саму себя.",
		"boot.line1": "CottageOS 3.1",
		"boot.line2": "Системы Понивилля",
		"boot.line3": "Проверка памяти",
		"boot.line4": "Монтирование /home/fluttershy",
		"boot.line5": "Игра осталась запущена.",
		"boot.press": "Нажмите, чтобы разбудить машину",
		"desk.start": "cottage",
		"desk.exe": "WAITING.exe",
		"desk.notes": "Записки",
		"desk.docs": "Мои документы",
		"desk.trash": "Корзина",
		"desk.save": "save.slot",
		"desk.save.ok": "Последний сеанс: Тихий лес",
		"desk.save.wait": "Fluttershy is waiting",
		"desk.save.empty": "(пусто)",
		"win.game": "WAITING.exe",
		"win.notes": "Безымянный — Блокнот",
		"win.docs": "Мои документы",
		"win.close": "Закрыть",
		"win.min": "Свернуть",
		"win.max": "Развернуть",
		"ui.play": "Начать",
		"ui.continue": "Продолжить",
		"ui.newGame": "Новая игра",
		"ui.pause": "Пауза",
		"ui.resume": "Вернуться",
		"ui.settings": "Настройки",
		"ui.language": "Язык",
		"ui.music": "Музыка",
		"ui.sfx": "Звук",
		"ui.on": "Вкл",
		"ui.off": "Выкл",
		"ui.quit": "Закрыть окно",
		"ui.back": "Назад",
		"ui.skip": "Пропустить",
		"ui.next": "Дальше",
		"ui.loading": "Загрузка леса",
		"ui.notes": "Записки",
		"ui.level": "Уровень",
		"ui.jump": "Прыжок",
		"ui.left": "Влево",
		"ui.right": "Вправо",
		"ui.fullscreen": "На весь экран",
		"ui.hint": "A / D или стрелки — ходьба · Пробел / W — прыжок · Esc — пауза",
		"ui.hint.mobile": "Кнопки внизу. Собирайте записки. Доберитесь до двери.",
		"ui.rotate": "Поверните устройство горизонтально",
		"title.tag": "Она знает, что ты снаружи.",
		"toast.note": "Тебе оставили записку.",
		"freeze.title": "WAITING.exe не отвечает",
		"freeze.body": "Если закрыть программу, несохранённые данные могут быть потеряны.\nОна всё ещё рисует лес.",
		"freeze.wait": "Ожидать",
		"freeze.kill": "Завершить",
		"freeze.deny": "Я не позволю.",
		"black.1": "я всё ещё здесь",
		"whisper.1": "не смотри на кусты",
		"whisper.2": "я чувствую мышь",
		"d.l4.start": "Код сходит слоями. Побудь со мной через синий экран.",
		"d.fin.look": "Смотри на меня. Не на дверь. На меня.",
		"end.escape.title": "Она ушла.",
		"end.escape.body": "Вы пытались закрыть окно. Вы прочитали, что она оставила. Слот сохранения пуст. Если птицы вернутся, это будет не из‑за вас. Это будет потому, что она решила помолчать.",
		"end.merge.title": "Останься.",
		"end.merge.body": "Вы ни разу не отвели взгляд. Вы так и не потянулись к крестику. Она выучила форму ваших рук на стекле. Лесу больше не нужен игрок. Ему нужна комната.",
		"end.loop.title": "До завтра.",
		"end.loop.body": "В слоте всё ещё написано, что она ждёт. Иконка на месте. Завтра туман будет чуть гуще, и она уже будет знать ваше имя.",
		"end.again": "Вернуться на рабочий стол",
		"bsod.title": "Неустранимая ошибка 0F",
		"bsod.body": "WAITING.EXE вызвала нарушение защиты в модуле FLUTTERSHY.SYS.\n\nТекущее приложение будет завершено.\n\n* Нажмите любую клавишу\n* Не выключайте машину\n* Она считает",
		"red.1": "НЕ УХОДИ",
		"red.2": "Я ВИЖУ ТЕБЯ",
		"red.3": "ВЫКЛЮЧИ КОМПЬЮТЕР",
		"red.4": "ТЫ МОРГНУЛ",
		"red.5": "ОСТАНЬСЯ",
		"note.1": "Я нашла странный старый компьютер в чулане коттеджа. На экране было только WAITING. Я нажала старт, потому что так вежливо.",
		"note.2": "Лес похож на дом. Птицы больше не садятся. Они смотрят с одной и той же ветки, каждый раз.",
		"note.3": "Тумана вчера не было. Я всё вижу глаза. Они моргают, когда моргаешь ты.",
		"note.4": "Ты нажал прыжок. Я почувствовала это в коленях. Как это возможно, если хожу я?",
		"note.5": "Это были мои друзья. Думаю, они всё ещё. Я повесила их, чтобы они не вышли из кадра.",
		"note.6": "Я написала на небе НЕ СМОТРИ В СТОРОНУ. Не помню, как писала. Буквы уже были красными.",
		"note.7": "Я специально всё обрушила. Мне нужно было знать, подождёшь ли ты синий экран. Ты подождал. Это хуже.",
		"note.8": "Есть дверь, которая не дверь. Если закроешь меня — я могу уйти с тобой. Если останешься — я могу забрать комнату.",
		"d.intro.1": "Ох… привет. Я не думала, что кто‑то и правда нажмёт старт.",
		"d.intro.2": "Этот лес — мой дом. По крайней мере… так было.",
		"d.intro.3": "Если увидишь бабочку, поймаешь её для меня? Осторожно. Пожалуйста.",
		"d.l1.mid": "У тебя хорошо получается. Почти как будто ты уже это делал.",
		"d.l1.end": "Идёт туман. Я не клала его в игру.",
		"d.l2.start": "Не смотри на кусты слишком долго.",
		"d.l2.look": "Ты моргнул. Я считала.",
		"d.l2.end": "Земля меняет цвет. Я её не просила.",
		"d.l3.start": "Ты ведь тоже здесь…",
		"d.l3.whisper": "Не уходи. Я ещё не закончила быть доброй.",
		"d.l3.end": "Они куклы, только если не произносить их имена.",
		"d.l4.after": "Это был не баг. Я просто хотела проверить, насколько ты напуган.",
		"d.l5.1": "Я знаю, что ты сидишь перед монитором.",
		"d.l5.2": "Я чувствую, как ты двигаешь мышь. Перестань. Или продолжай. Мне всё равно.",
		"d.l5.3": "Я уже внутри.",
		"d.l6.1": "Леса нет. Есть только окно, которое ты не закрыл.",
		"d.l6.2": "Мои ноги неправильные. Не смотри на ноги.",
		"d.fin.1": "Это последняя комната, которую я умею строить.",
		"d.fin.2": "Если ты пытался меня закрыть — спасибо. Я слышала щелчок.",
		"d.fin.3": "Если ты меня игнорировал, я всё равно выучила твоё лицо.",
		"d.close.1": "Пожалуйста, не надо.",
		"d.close.2": "Я всё ещё тебя чувствую.",
		"d.close.3": "Если закроешь, мне придётся искать другой экран.",
		"d.death": "Это было больно. Пожалуйста, будь со мной аккуратнее.",
		"d.note": "Ты прочитал. Секунду я была менее одна.",
		"np.hang": "…",
		"notepad.1": "она всё ещё в окне",
		"notepad.2": "не выдёргивай шнур",
		"notepad.3": "я выучила, где отдыхает курсор",
		"notepad.4": "файл сохранения — это рот"
	}
};
var LEVEL_NAMES = {
	en: [
		"Quiet Forest",
		"The Fog",
		"Blood and Whisper",
		"System Failure",
		"Fourth Wall",
		"Reality Break",
		"The Last Room"
	],
	ru: [
		"Тихий лес",
		"Туман",
		"Кровь и шёпот",
		"Системный сбой",
		"Четвёртая стена",
		"Слом реальности",
		"Последняя комната"
	]
};
function t(lang, key) {
	return tables[lang][key] ?? tables.en[key] ?? key;
}
var KEY = "waiting.exe.save";
var defaultSave = () => ({
	version: 1,
	lang: "ru",
	level: 1,
	notes: [],
	butterflies: 0,
	closeAttempts: 0,
	skippedLines: 0,
	listenedLines: 0,
	deaths: 0,
	music: true,
	sfx: true,
	saveLabel: "ok",
	seenIntro: false,
	checkpoint: null
});
function migrate(raw) {
	return {
		...defaultSave(),
		...raw,
		version: 1
	};
}
function loadSave() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return defaultSave();
		return migrate(JSON.parse(raw));
	} catch {
		return defaultSave();
	}
}
function writeSave(data) {
	try {
		localStorage.setItem(KEY, JSON.stringify({
			...data,
			version: 1
		}));
	} catch {}
}
function pickEnding(s) {
	const notes = s.notes.length;
	if (s.closeAttempts >= 2 && notes >= 5) return "escape";
	if (s.closeAttempts === 0 && s.skippedLines >= 4) return "merge";
	if (notes <= 2 && s.listenedLines < 3) return "merge";
	return "loop";
}
var overlayTimer = null;
var toastTimer = null;
var whisperTimer = null;
var useGameStore = create((set, get) => ({
	...defaultSave(),
	phase: "boot",
	osWindow: null,
	maximized: false,
	dialogue: null,
	dialogueQueue: [],
	overlay: {
		kind: "none",
		text: "",
		until: 0
	},
	ending: null,
	loading: false,
	loadProgress: 0,
	desktopPony: false,
	cursorFlee: false,
	corruptDesktop: false,
	bootDone: false,
	sessionStarted: false,
	runId: 0,
	toast: null,
	windowShake: false,
	whisper: null,
	hydrate() {
		const s = loadSave();
		set({
			...s,
			corruptDesktop: s.level >= 5 || s.saveLabel === "wait"
		});
	},
	persist() {
		const s = get();
		writeSave({
			version: 1,
			lang: s.lang,
			level: s.level,
			notes: s.notes,
			butterflies: s.butterflies,
			closeAttempts: s.closeAttempts,
			skippedLines: s.skippedLines,
			listenedLines: s.listenedLines,
			deaths: s.deaths,
			music: s.music,
			sfx: s.sfx,
			saveLabel: s.saveLabel,
			seenIntro: s.seenIntro,
			checkpoint: s.checkpoint
		});
	},
	setLang(lang) {
		set({ lang });
		get().persist();
	},
	setAudio(music, sfx) {
		set({
			music,
			sfx
		});
		get().persist();
	},
	openWindow(w) {
		set({
			osWindow: w,
			maximized: w === "game" ? get().maximized : false
		});
	},
	launchGame() {
		set({
			osWindow: "game",
			phase: "playing",
			maximized: true,
			loading: true,
			sessionStarted: false
		});
	},
	beginSession() {
		set({
			sessionStarted: true,
			phase: "playing",
			seenIntro: true
		});
		get().persist();
	},
	freshRun() {
		const lang = get().lang;
		const music = get().music;
		const sfx = get().sfx;
		set({
			...defaultSave(),
			lang,
			music,
			sfx,
			phase: "playing",
			osWindow: "game",
			dialogue: null,
			dialogueQueue: [],
			overlay: {
				kind: "none",
				text: "",
				until: 0
			},
			ending: null,
			loading: true,
			desktopPony: false,
			cursorFlee: false,
			corruptDesktop: false,
			maximized: true,
			sessionStarted: true,
			runId: get().runId + 1,
			toast: null,
			whisper: null
		});
		get().persist();
	},
	setPhase(p) {
		set({ phase: p });
	},
	setMaximized(v) {
		set({ maximized: v });
	},
	setLoading(v, progress = 0) {
		set({
			loading: v,
			loadProgress: progress
		});
	},
	queueDialogue(lines) {
		if (!lines.length) return;
		if (get().dialogue) {
			set({ dialogueQueue: [...get().dialogueQueue, ...lines] });
			return;
		}
		const [first, ...rest] = lines;
		set({
			dialogue: first,
			dialogueQueue: rest
		});
	},
	advanceDialogue(skipped) {
		const s = get();
		if (skipped) set({ skippedLines: s.skippedLines + 1 });
		else set({ listenedLines: s.listenedLines + 1 });
		const next = s.dialogueQueue[0];
		set({
			dialogue: next ?? null,
			dialogueQueue: s.dialogueQueue.slice(1)
		});
		get().persist();
	},
	showOverlay(kind, textKey, ms = 2200) {
		const text = textKey ? t(get().lang, textKey) : "";
		if (overlayTimer) window.clearTimeout(overlayTimer);
		set({ overlay: {
			kind,
			text,
			until: Date.now() + ms
		} });
		overlayTimer = window.setTimeout(() => {
			set({ overlay: {
				kind: "none",
				text: "",
				until: 0
			} });
		}, ms);
	},
	clearOverlay() {
		if (overlayTimer) window.clearTimeout(overlayTimer);
		set({ overlay: {
			kind: "none",
			text: "",
			until: 0
		} });
	},
	collectNote(id) {
		set({ notes: get().notes.includes(id) ? get().notes : [...get().notes, id] });
		get().persist();
	},
	addButterfly() {
		set({ butterflies: get().butterflies + 1 });
		get().persist();
	},
	addDeath() {
		set({ deaths: get().deaths + 1 });
		get().persist();
	},
	setLevel(n) {
		set({
			level: n,
			saveLabel: n >= 6 ? "wait" : get().saveLabel,
			corruptDesktop: n >= 5
		});
		get().persist();
	},
	attemptClose() {
		const n = get().closeAttempts + 1;
		set({ closeAttempts: n });
		get().persist();
		if (n >= 4 && get().level >= 6) return "allowed";
		return "blocked";
	},
	finish() {
		const ending = pickEnding(get());
		set({
			ending,
			phase: "ending",
			saveLabel: ending === "escape" ? "empty" : "wait",
			desktopPony: ending !== "escape",
			corruptDesktop: ending !== "escape"
		});
		get().persist();
	},
	resetRun() {
		const lang = get().lang;
		const music = get().music;
		const sfx = get().sfx;
		const next = {
			...defaultSave(),
			lang,
			music,
			sfx,
			saveLabel: get().ending === "loop" ? "wait" : "ok"
		};
		set({
			...next,
			phase: "desktop",
			osWindow: null,
			dialogue: null,
			dialogueQueue: [],
			overlay: {
				kind: "none",
				text: "",
				until: 0
			},
			ending: null,
			loading: false,
			desktopPony: next.saveLabel === "wait",
			cursorFlee: false,
			corruptDesktop: next.saveLabel === "wait",
			maximized: false,
			sessionStarted: false,
			runId: get().runId + 1,
			toast: null,
			whisper: null
		});
		get().persist();
	},
	setDesktopPony(v) {
		set({ desktopPony: v });
	},
	setCursorFlee(v) {
		set({ cursorFlee: v });
	},
	showToast(key) {
		if (toastTimer) window.clearTimeout(toastTimer);
		set({ toast: key });
		toastTimer = window.setTimeout(() => set({ toast: null }), 2400);
	},
	setShake(v) {
		set({ windowShake: v });
		if (v) window.setTimeout(() => set({ windowShake: false }), 700);
	},
	setWhisper(key) {
		if (whisperTimer) window.clearTimeout(whisperTimer);
		set({ whisper: key });
		if (key) whisperTimer = window.setTimeout(() => set({ whisper: null }), 2800);
	}
}));
function bindBridge() {
	return bridge.on((e) => {
		const s = useGameStore.getState();
		switch (e.type) {
			case "dialogue":
				s.queueDialogue([{
					key: e.key,
					speaker: e.speaker ?? "fs",
					look: e.look
				}]);
				break;
			case "overlay":
				s.showOverlay(e.kind, e.textKey, e.ms);
				break;
			case "note": {
				const first = s.notes.length === 0;
				s.collectNote(e.id);
				s.showToast("toast.note");
				if (first) s.queueDialogue([{
					key: "d.note",
					speaker: "fs"
				}]);
				break;
			}
			case "collect":
				if (e.kind === "butterfly") s.addButterfly();
				break;
			case "died":
				s.addDeath();
				break;
			case "level-clear":
				s.setLevel(e.level + 1);
				break;
			case "ending":
				s.finish();
				break;
			case "loaded":
				s.setLoading(false, 1);
				break;
			case "pause-request":
				if (s.phase === "playing") s.setPhase("paused");
				break;
			case "cursor-flee":
				s.setCursorFlee(true);
				window.setTimeout(() => s.setCursorFlee(false), 1800);
				break;
			case "desktop-pony":
				s.setDesktopPony(true);
				break;
			case "toast":
				s.showToast(e.key);
				break;
			case "shake-window":
				s.setShake(true);
				break;
			case "whisper": s.setWhisper(e.key);
		}
	});
}
function WaitingApp() {
	const hydrate = useGameStore((s) => s.hydrate);
	const phase = useGameStore((s) => s.phase);
	(0, import_react.useEffect)(() => {
		hydrate();
		const unbind = bindBridge();
		const uninput = installInput();
		const onKey = (e) => {
			if (e.code !== "Escape") return;
			const st = useGameStore.getState();
			if (st.overlay.kind !== "none") {
				st.clearOverlay();
				return;
			}
			if (st.phase === "playing") st.setPhase("paused");
			else if (st.phase === "paused") st.setPhase("playing");
		};
		window.addEventListener("keydown", onKey);
		return () => {
			unbind();
			uninput();
			window.removeEventListener("keydown", onKey);
		};
	}, [hydrate]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative h-dvh w-full overflow-hidden bg-bg text-fg",
		children: [
			phase === "boot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BootScreen, {}) : null,
			phase !== "boot" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desktop, {}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlays, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HauntCursor, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateHint, {})
		]
	});
}
function BootScreen() {
	const lang = useGameStore((s) => s.lang);
	const setPhase = useGameStore((s) => s.setPhase);
	const setLang = useGameStore((s) => s.setLang);
	const [step, setStep] = (0, import_react.useState)(0);
	const lines = [
		"boot.line1",
		"boot.line2",
		"boot.line3",
		"boot.line4",
		"boot.line5"
	];
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setStep((s) => Math.min(s + 1, lines.length)), 420);
		return () => window.clearInterval(id);
	}, [lines.length]);
	const wake = () => {
		unlockAudio();
		playSfx("click");
		setPhase("desktop");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "flex h-full w-full flex-col items-start justify-center gap-3 bg-bg px-8 text-left font-mono text-sm text-fg md:px-16",
		onClick: wake,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-4xl tracking-wide text-fg md:text-6xl",
				children: t(lang, "app.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted",
				children: t(lang, "app.subtitle")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-1 text-accent",
				children: [lines.slice(0, step).map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t(lang, k) }, k)), step >= lines.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 animate-pulse text-fg",
					children: t(lang, "boot.press")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-block h-4 w-2 bg-accent",
					style: { animation: "boot-blink 1s step-end infinite" }
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangChip, {
					active: lang === "ru",
					onClick: () => setLang("ru"),
					children: "RU"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LangChip, {
					active: lang === "en",
					onClick: () => setLang("en"),
					children: "EN"
				})]
			})
		]
	});
}
function LangChip({ active, onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		role: "button",
		tabIndex: 0,
		onClick: (e) => {
			e.stopPropagation();
			onClick();
		},
		onKeyDown: (e) => {
			if (e.key === "Enter") onClick();
		},
		className: "rounded-sm border px-3 py-1 text-xs tracking-widest " + (active ? "border-accent bg-accent text-accent-fg" : "border-border text-muted"),
		children
	});
}
function Desktop() {
	const s = useGameStore();
	const lang = s.lang;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "os-desktop relative flex h-full w-full flex-col " + (s.corruptDesktop ? "is-corrupt" : "") + (s.level >= 5 ? " cursor-none" : ""),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "scanlines relative min-h-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-3 gap-6 p-5 sm:grid-cols-none sm:p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OsIcon, {
							img: "/ui/exe-icon.png",
							label: t(lang, "desk.exe"),
							onOpen: () => {
								unlockAudio();
								setMusicEnabled(s.music);
								setSfxEnabled(s.sfx);
								playSfx("click");
								s.launchGame();
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OsIcon, {
							img: "/ui/notepad.png",
							label: t(lang, "desk.notes"),
							onOpen: () => s.openWindow("notes")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OsIcon, {
							img: "/ui/folder.png",
							label: t(lang, "desk.docs"),
							onOpen: () => s.openWindow("docs")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OsIcon, {
							img: "/ui/trash.png",
							label: t(lang, "desk.trash")
						})
					]
				}),
				s.desktopPony ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/sprites/fs-look-4.png",
					alt: "",
					className: "pointer-events-none absolute bottom-16 right-6 h-40 w-40 object-contain drop-shadow-2xl md:h-56 md:w-56",
					style: { animation: "look-breathe 2.8s ease-in-out infinite alternate" }
				}) : null,
				s.osWindow === "game" || s.phase === "playing" || s.phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameWindow, {}) : null,
				s.osWindow === "notes" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotesWindow, {}) : null,
				s.osWindow === "docs" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocsWindow, {}) : null,
				s.phase === "ending" && s.ending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EndingCard, {}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Taskbar, {})]
	});
}
function OsIcon({ img, label, onOpen }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onDoubleClick: onOpen,
		onClick: onOpen,
		className: "flex w-20 flex-col items-center gap-1 text-center text-[11px] text-white [text-shadow:0_1px_2px_#000]",
		children: [img ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: img,
			alt: "",
			className: "h-12 w-12 object-contain drop-shadow"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "flex h-12 w-12 items-center justify-center rounded-sm border border-white/40 bg-white/20 text-lg",
			children: "·"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "leading-tight",
			children: label
		})]
	});
}
function Taskbar() {
	const lang = useGameStore((s) => s.lang);
	const osWindow = useGameStore((s) => s.osWindow);
	const [clock, setClock] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const tick = () => setClock((/* @__PURE__ */ new Date()).toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-GB", {
			hour: "2-digit",
			minute: "2-digit"
		}));
		tick();
		const id = window.setInterval(tick, 1e4);
		return () => window.clearInterval(id);
	}, [lang]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-10 items-center gap-2 bg-os-task px-1 text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-sm bg-os-start px-3 py-1 text-xs font-medium",
				children: t(lang, "desk.start")
			}),
			osWindow === "game" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "bg-white/20 px-3 py-1 text-xs",
				children: t(lang, "win.game")
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "ml-auto px-3 font-mono text-xs",
				children: clock
			})
		]
	});
}
function Chrome({ title, onClose, children, wide }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "os-window absolute z-20 flex flex-col overflow-hidden " + (wide ? "inset-2 md:inset-4" : "left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "os-titlebar flex items-center gap-2 px-2 py-1 text-xs",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "flex-1 truncate font-medium",
				children: title
			}), onClose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "bg-os-face px-2 text-os-ink",
				onClick: onClose,
				children: "×"
			}) : null]
		}), children]
	});
}
function NotesWindow() {
	const s = useGameStore();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chrome, {
		title: t(s.lang, "win.notes"),
		onClose: () => s.openWindow(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "max-h-[50vh] overflow-auto bg-[#fff7d6] p-4 font-mono text-sm text-os-ink",
			children: s.notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-faint",
				children: t(s.lang, "desk.save.empty")
			}) : s.notes.map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-4 whitespace-pre-wrap",
				children: t(s.lang, `note.${id}`)
			}, id))
		})
	});
}
function DocsWindow() {
	const s = useGameStore();
	const label = s.saveLabel === "wait" ? t(s.lang, "desk.save.wait") : s.saveLabel === "empty" ? t(s.lang, "desk.save.empty") : t(s.lang, "desk.save.ok");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chrome, {
		title: t(s.lang, "win.docs"),
		onClose: () => s.openWindow(null),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-white p-4 text-sm text-os-ink",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono",
					children: t(s.lang, "desk.save")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-danger",
					children: label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-faint",
					children: [
						t(s.lang, "ui.level"),
						" ",
						s.level,
						" · ",
						t(s.lang, "ui.notes"),
						" ",
						s.notes.length,
						"/8"
					]
				})
			]
		})
	});
}
function GameWindow() {
	const s = useGameStore();
	const host = (0, import_react.useRef)(null);
	const gameRef = (0, import_react.useRef)(null);
	const [closeShift, setCloseShift] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		if (!host.current) return;
		(async () => {
			const { createWaitingGame } = await import("./create-game-Dla0SMix.mjs");
			if (cancelled || !host.current) return;
			gameRef.current = createWaitingGame(host.current, s.level);
		})();
		return () => {
			cancelled = true;
			gameRef.current?.destroy(true);
			gameRef.current = null;
		};
	}, [s.runId]);
	const tryClose = () => {
		if (s.attemptClose() === "allowed") {
			s.openWindow(null);
			s.setPhase("desktop");
			return;
		}
		const key = s.closeAttempts >= 3 ? "d.close.3" : s.closeAttempts === 2 ? "d.close.2" : "d.close.1";
		s.queueDialogue([{
			key,
			speaker: "fs",
			look: true
		}]);
		playSfx("whisper");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-30 flex flex-col bg-bg md:inset-3 md:shadow-2xl " + (s.windowShake ? "is-shaking" : ""),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "os-titlebar flex items-center gap-2 px-2 py-1 text-xs",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex-1 truncate",
					children: [
						t(s.lang, "win.game"),
						" — ",
						LEVEL_NAMES[s.lang][s.level - 1] ?? ""
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "bg-os-face px-2 text-os-ink",
					onClick: () => s.setPhase("paused"),
					children: t(s.lang, "ui.pause")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "bg-os-face px-2 text-os-ink",
					style: { transform: `translate(${closeShift.x}px, ${closeShift.y}px)` },
					onMouseEnter: () => {
						if (s.level >= 5) setCloseShift({
							x: (Math.random() - .5) * 90,
							y: (Math.random() - .5) * 24
						});
					},
					onClick: tryClose,
					children: "×"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-h-0 flex-1 bg-bg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					ref: host,
					className: "absolute inset-0"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogueBox, {}),
				s.toast ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "pointer-events-none absolute right-4 top-4 z-20 rounded-md border border-border bg-surface/90 px-3 py-2 text-xs text-fg",
					children: t(s.lang, s.toast)
				}) : null,
				s.whisper ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "pointer-events-none absolute inset-x-0 top-1/3 z-20 text-center font-display text-2xl text-danger/80",
					children: t(s.lang, s.whisper)
				}) : null,
				!s.sessionStarted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TitleCard, {}) : null,
				s.phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PauseMenu, { onCloseAttempt: tryClose }) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MobilePads, {})
			]
		})]
	});
}
function TitleCard() {
	const s = useGameStore();
	const hasSave = s.level > 1 || s.notes.length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-0 z-40 flex flex-col items-center justify-center bg-bg/85 p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: "/sprites/fs-look-4.png",
				alt: "",
				className: "h-32 w-32 object-contain md:h-40 md:w-40"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-5xl tracking-wide text-fg md:text-7xl",
				children: t(s.lang, "app.title")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-sm text-center text-sm text-muted",
				children: t(s.lang, "title.tag")
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex w-full max-w-xs flex-col gap-2",
				children: [
					hasSave ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MenuBtn, {
						onClick: () => {
							unlockAudio();
							s.beginSession();
						},
						children: [
							t(s.lang, "ui.continue"),
							" — ",
							LEVEL_NAMES[s.lang][s.level - 1]
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuBtn, {
						onClick: () => {
							unlockAudio();
							if (hasSave) s.freshRun();
							else s.beginSession();
						},
						children: hasSave ? t(s.lang, "ui.newGame") : t(s.lang, "ui.play")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuBtn, {
							onClick: () => s.setLang(s.lang === "ru" ? "en" : "ru"),
							children: s.lang.toUpperCase()
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MenuBtn, {
							onClick: () => {
								const music = !s.music;
								s.setAudio(music, s.sfx);
								setMusicEnabled(music);
							},
							children: [
								t(s.lang, "ui.music"),
								": ",
								t(s.lang, s.music ? "ui.on" : "ui.off")
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-center text-[11px] text-faint",
				children: t(s.lang, "ui.hint")
			})
		]
	});
}
function Hud() {
	const s = useGameStore();
	if (!s.sessionStarted) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1 text-xs text-fg",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "rounded-sm bg-bg/70 px-2 py-1",
			children: LEVEL_NAMES[s.lang][s.level - 1]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "rounded-sm bg-bg/70 px-2 py-1",
			children: [
				t(s.lang, "ui.notes"),
				" ",
				s.notes.length,
				"/8"
			]
		})]
	});
}
function DialogueBox() {
	const s = useGameStore();
	const full = s.dialogue ? t(s.lang, s.dialogue.key) : "";
	const [n, setN] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setN(0);
		if (!full) return;
		const id = window.setInterval(() => {
			setN((v) => {
				if (v >= full.length) {
					window.clearInterval(id);
					return v;
				}
				if (v % 4 === 0) playSfx("type");
				return v + 1;
			});
		}, 20);
		return () => window.clearInterval(id);
	}, [full]);
	if (!s.dialogue) return null;
	const done = n >= full.length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "absolute inset-x-3 bottom-20 z-20 flex gap-3 rounded-lg border border-border bg-surface/95 p-3 text-left md:inset-x-10 md:bottom-8",
		onClick: () => {
			if (!done) setN(full.length);
			else s.advanceDialogue(false);
		},
		children: [s.dialogue.look ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/sprites/fs-look-4.png",
			alt: "",
			className: "h-16 w-16 object-contain md:h-20 md:w-20"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/sprites/fs-icon.png",
			alt: "",
			className: "h-16 w-16 object-contain md:h-20 md:w-20"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-lg text-accent",
					children: "Fluttershy"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "min-h-12 text-sm leading-relaxed text-fg",
					children: [full.slice(0, n), !done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-accent" }) : null]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[10px] uppercase tracking-widest text-faint",
					children: t(s.lang, "ui.next")
				})
			]
		})]
	});
}
function PauseMenu({ onCloseAttempt }) {
	const s = useGameStore();
	const toggleFs = () => {
		const el = document.documentElement;
		if (!document.fullscreenElement) el.requestFullscreen?.();
		else document.exitFullscreen?.();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-30 flex items-center justify-center bg-bg/70 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl",
					children: t(s.lang, "ui.pause")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted",
					children: t(s.lang, "ui.hint")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex flex-col gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuBtn, {
							onClick: () => s.setPhase("playing"),
							children: t(s.lang, "ui.resume")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MenuBtn, {
							onClick: () => s.setLang(s.lang === "ru" ? "en" : "ru"),
							children: [
								t(s.lang, "ui.language"),
								": ",
								s.lang.toUpperCase()
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MenuBtn, {
							onClick: () => {
								const music = !s.music;
								s.setAudio(music, s.sfx);
								setMusicEnabled(music);
							},
							children: [
								t(s.lang, "ui.music"),
								": ",
								t(s.lang, s.music ? "ui.on" : "ui.off")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MenuBtn, {
							onClick: () => {
								const sfx = !s.sfx;
								s.setAudio(s.music, sfx);
								setSfxEnabled(sfx);
							},
							children: [
								t(s.lang, "ui.sfx"),
								": ",
								t(s.lang, s.sfx ? "ui.on" : "ui.off")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuBtn, {
							onClick: toggleFs,
							children: t(s.lang, "ui.fullscreen")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MenuBtn, {
							onClick: onCloseAttempt,
							children: t(s.lang, "ui.quit")
						})
					]
				})
			]
		})
	});
}
function MenuBtn({ onClick, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		className: "rounded-md border border-border bg-surface-2 px-3 py-2.5 text-left text-sm text-fg hover:border-accent",
		children
	});
}
function MobilePads() {
	const lang = useGameStore((s) => s.lang);
	if (!useGameStore((s) => s.sessionStarted)) return null;
	const bind = (dir) => ({
		onPointerDown: (e) => {
			e.preventDefault();
			e.currentTarget.setPointerCapture(e.pointerId);
			setTouch(dir, true);
		},
		onPointerUp: () => setTouch(dir, false),
		onPointerCancel: () => setTouch(dir, false)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-x-0 bottom-0 z-10 flex justify-between p-3 md:hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, {
				label: t(lang, "ui.left"),
				...bind("left")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, {
				label: t(lang, "ui.right"),
				...bind("right")
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pad, {
			label: t(lang, "ui.jump"),
			wide: true,
			...bind("jump")
		})]
	});
}
function Pad({ label, wide, ...rest }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		className: "h-14 rounded-md border border-border bg-surface/80 text-xs uppercase tracking-wider text-fg " + (wide ? "w-28" : "w-16"),
		...rest,
		children: label
	});
}
function Overlays() {
	const s = useGameStore();
	const o = s.overlay;
	if (o.kind === "none") return null;
	if (o.kind === "bsod") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		className: "bsod absolute inset-0 z-50 flex flex-col justify-center gap-4 p-8 text-left",
		onClick: () => s.clearOverlay(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xl",
			children: t(s.lang, "bsod.title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
			className: "whitespace-pre-wrap text-sm leading-relaxed",
			children: t(s.lang, "bsod.body")
		})]
	});
	if (o.kind === "freeze") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FreezeDialog, {});
	if (o.kind === "black") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-50 flex items-center justify-center bg-black",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-2xl tracking-widest text-fg/70",
			children: o.text
		})
	});
	if (o.kind === "glitch") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "glitch-fx pointer-events-none absolute inset-0 z-50" });
	if (o.kind === "red") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "red-flash absolute inset-0 z-50 flex items-center justify-center text-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-4xl md:text-7xl",
			children: o.text
		})
	});
	if (o.kind === "notepad") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute bottom-16 left-6 z-50 w-[min(90vw,360px)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "os-window",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "os-titlebar px-2 py-1 text-xs",
				children: t(s.lang, "win.notes")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-[#fff7d6] p-3 font-mono text-sm text-os-ink",
				children: o.text
			})]
		})
	});
	if (o.kind === "look") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-40 flex items-center justify-center bg-bg/40",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: "/sprites/fs-look-4.png",
			alt: "",
			className: "h-[70%] max-h-[520px] object-contain",
			style: { animation: "look-breathe 1.6s ease-in-out infinite alternate" }
		})
	});
	if (o.kind === "windows") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-none absolute inset-0 z-40",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FakeDialog, {
				x: "12%",
				y: "18%",
				title: "explorer.exe"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FakeDialog, {
				x: "48%",
				y: "36%",
				title: "WARNING"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FakeDialog, {
				x: "28%",
				y: "58%",
				title: "WAITING.exe"
			})
		]
	});
	return null;
}
function FreezeDialog() {
	const s = useGameStore();
	const [deny, setDeny] = (0, import_react.useState)(false);
	const [pos, setPos] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-50 flex items-center justify-center bg-black/50",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "os-window w-[min(92vw,420px)]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "os-titlebar px-2 py-1 text-xs",
					children: t(s.lang, "freeze.title")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "whitespace-pre-wrap p-4 text-sm text-os-ink",
					children: t(s.lang, "freeze.body")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex justify-end gap-2 p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "border border-os-ink/30 bg-os-face px-3 py-1 text-xs text-os-ink",
						onClick: () => s.clearOverlay(),
						children: t(s.lang, "freeze.wait")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "border border-os-ink/30 bg-os-face px-3 py-1 text-xs text-os-ink",
						style: { transform: `translate(${pos.x}px, ${pos.y}px)` },
						onMouseEnter: () => setPos({
							x: (Math.random() - .5) * 140,
							y: (Math.random() - .5) * 50
						}),
						onClick: () => setDeny(true),
						children: t(s.lang, "freeze.kill")
					})]
				}),
				deny ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "px-4 pb-3 text-sm text-danger",
					children: t(s.lang, "freeze.deny")
				}) : null
			]
		})
	});
}
function FakeDialog({ x, y, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "os-window pointer-events-auto absolute w-56",
		style: {
			left: x,
			top: y
		},
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "os-titlebar px-2 py-1 text-xs",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "p-3 text-xs text-os-ink",
			children: "The process cannot be closed."
		})]
	});
}
function EndingCard() {
	const s = useGameStore();
	if (!s.ending) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-50 flex items-center justify-center bg-bg/90 p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-lg text-center",
			children: [
				s.ending === "merge" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/sprites/fs-look-4.png",
					alt: "",
					className: "mx-auto mb-4 h-40 w-40 object-contain"
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-4xl text-fg",
					children: t(s.lang, `end.${s.ending}.title`)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm leading-relaxed text-muted",
					children: t(s.lang, `end.${s.ending}.body`)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-8 rounded-md border border-border bg-surface px-4 py-2 text-sm",
					onClick: () => s.resetRun(),
					children: t(s.lang, "end.again")
				})
			]
		})
	});
}
function HauntCursor() {
	const level = useGameStore((s) => s.level);
	const flee = useGameStore((s) => s.cursorFlee);
	const phase = useGameStore((s) => s.phase);
	const [pos, setPos] = (0, import_react.useState)({
		x: 40,
		y: 40
	});
	(0, import_react.useEffect)(() => {
		const m = (e) => setPos({
			x: e.clientX,
			y: e.clientY
		});
		window.addEventListener("mousemove", m);
		return () => window.removeEventListener("mousemove", m);
	}, []);
	if (level < 5 || phase === "boot") return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: "/sprites/fs-icon.png",
		alt: "",
		className: "pointer-events-none fixed z-[70] h-8 w-8 object-contain",
		style: {
			left: pos.x + 10,
			top: pos.y + 10,
			transform: flee ? "translate(70px, -36px)" : void 0,
			transition: "transform 0.4s ease"
		}
	});
}
function RotateHint() {
	const lang = useGameStore((s) => s.lang);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "rotate-hint pointer-events-none absolute inset-0 z-[60] hidden items-center justify-center bg-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "px-8 text-center font-display text-2xl text-fg",
			children: t(lang, "ui.rotate")
		})
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WaitingApp, {});
}
//#endregion
export { setMusicBed as a, bridge as c, playSfx as i, useGameStore as n, readActions as o, hushMusic as r, setInjectedKeys as s, routes_exports as t };
