import { useEffect, useMemo, useRef, useState } from "react";
import { t } from "@/game/i18n";
import { playSfx } from "@/game/audio";
import { useGameStore } from "@/store/game-store";

const RU_EARLY = [
  "Ты снова поставил игру на паузу.",
  "Я могу подождать.",
  "Ты всё ещё здесь?",
];
const EN_EARLY = [
  "You paused the game again.",
  "I can wait.",
  "You're still here?",
];

const RU_MID = [
  "Я заметила, что ты часто смотришь на это меню.",
  "Ты читаешь мои записи, да?",
  "Когда ты ставишь игру на паузу, я всё равно тебя слышу.",
  "Не закрывай меня так быстро.",
];
const EN_MID = [
  "I noticed how often you open this menu.",
  "You're reading my notes, aren't you?",
  "When you pause the game, I can still hear you.",
  "Don't close me so quickly.",
];

const RU_LATE = [
  "Ты думаешь, пауза остановила меня?",
  "Я вижу твой курсор.",
  "Не смотри на меню. Смотри на меня.",
  "Ты уже знаешь, что я не должна была это говорить.",
  "Ты пришёл проверить, стану ли я страшнее.",
];
const EN_LATE = [
  "You think the pause stopped me?",
  "I can see your cursor.",
  "Don't look at the menu. Look at me.",
  "You already know I wasn't supposed to say that.",
  "You came back to see if I'd get worse.",
];

const RU_IDLE = [
  "Почему ты стоишь?",
  "Ты ждёшь, пока я что-нибудь сделаю?",
  "Я тоже жду.",
];
const EN_IDLE = [
  "Why are you standing there?",
  "Are you waiting for me to do something?",
  "I'm waiting too.",
];

const RU_IDLE_LATE = [
  "Ты перестал двигаться. Я знаю почему.",
  "Можешь не двигаться. Я всё равно тебя вижу.",
  "Не притворяйся, что меня здесь нет.",
];
const EN_IDLE_LATE = [
  "You stopped moving. I know why.",
  "You don't have to move. I can still see you.",
  "Don't pretend I'm not here.",
];

function pick(list: string[], seed: number) {
  return list[Math.abs(seed) % list.length] ?? list[0] ?? "";
}

export function PlayerAwareness() {
  const phase = useGameStore((s) => s.phase);
  const lang = useGameStore((s) => s.lang);
  const level = useGameStore((s) => s.level);
  const deaths = useGameStore((s) => s.deaths);
  const closeAttempts = useGameStore((s) => s.closeAttempts);
  const hauntStage = useGameStore((s) => s.hauntStage);
  const notes = useGameStore((s) => s.notes.length);
  const [text, setText] = useState("");
  const [visible, setVisible] = useState(false);
  const seedRef = useRef(0);
  const pausedAtRef = useRef(0);
  const lastActivityRef = useRef(Date.now());

  const horrorStage = Math.max(
    hauntStage,
    level >= 5 ? 5 : 0,
    closeAttempts >= 4 ? 4 : 0,
    deaths >= 3 ? 4 : 0,
    notes >= 7 ? 3 : 0,
  );

  const pool = useMemo(() => {
    if (horrorStage >= 4) return lang === "ru" ? RU_LATE : EN_LATE;
    if (horrorStage >= 2) return lang === "ru" ? RU_MID : EN_MID;
    return lang === "ru" ? RU_EARLY : EN_EARLY;
  }, [horrorStage, lang]);

  useEffect(() => {
    const markActive = () => {
      lastActivityRef.current = Date.now();
    };
    window.addEventListener("pointermove", markActive, { passive: true });
    window.addEventListener("keydown", markActive);
    return () => {
      window.removeEventListener("pointermove", markActive);
      window.removeEventListener("keydown", markActive);
    };
  }, []);

  useEffect(() => {
    if (phase !== "paused") {
      setVisible(false);
      return;
    }

    seedRef.current += 1;
    pausedAtRef.current = Date.now();
    setText(pick(pool, seedRef.current + level + deaths + closeAttempts));
    setVisible(true);
    playSfx("whisper");

    const reveal = window.setTimeout(() => {
      if (horrorStage >= 3) {
        setText(pick(pool, seedRef.current + 3));
      }
    }, 3200);

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - pausedAtRef.current;
      if (elapsed < 6500) return;
      if (Math.random() < 0.42) {
        seedRef.current += 1;
        setText(pick(pool, seedRef.current + Math.round(elapsed / 1000)));
        playSfx("whisper");
      }
    }, 5000);

    return () => {
      window.clearTimeout(reveal);
      window.clearInterval(interval);
    };
  }, [phase, pool, level, deaths, closeAttempts, horrorStage]);

  useEffect(() => {
    if (phase !== "playing") return;
    const interval = window.setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      const threshold = horrorStage >= 4 ? 18000 : horrorStage >= 2 ? 28000 : 42000;
      if (idleMs < threshold || visible) return;
      if (Math.random() > 0.34) return;
      const idlePool = horrorStage >= 4
        ? lang === "ru" ? RU_IDLE_LATE : EN_IDLE_LATE
        : lang === "ru" ? RU_IDLE : EN_IDLE;
      seedRef.current += 1;
      setText(pick(idlePool, seedRef.current + level));
      setVisible(true);
      playSfx("whisper");
      window.setTimeout(() => setVisible(false), horrorStage >= 4 ? 5000 : 3600);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [phase, horrorStage, lang, level, visible]);

  useEffect(() => {
    if (!visible || phase !== "paused") return;
    const onPointer = () => {
      if (horrorStage < 4) return;
      if (Math.random() > 0.28) return;
      setText(lang === "ru" ? "Я знаю, куда ты сейчас двигаешь мышь." : "I know where you're moving the mouse.");
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, [visible, phase, horrorStage, lang]);

  if (!visible || !text || phase === "ending") return null;

  return (
    <div className={"player-awareness " + (horrorStage >= 4 ? "is-terrifying" : horrorStage >= 2 ? "is-aware" : "") + (phase === "playing" ? " is-idle" : "")}>
      <div className="player-awareness__dot" />
      <div className="player-awareness__label">{t(lang, "app.title")} // 0xUSER</div>
      <p>{text}</p>
    </div>
  );
}
