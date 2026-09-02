import { useEffect, useRef, useState } from "react";
import { playSfx } from "@/game/audio";
import { useGameStore } from "@/store/game-store";

const RU: Record<string, string> = {
  "death.react.1": "Это было больно. Пожалуйста, осторожнее со мной.",
  "death.react.2": "Снова? Я думала, ты попробуешь в этот раз по-другому.",
  "death.react.3": "Ты ведь специально это делаешь, да?",
  "death.react.4": "Я уже знаю это место. Ты тоже. Зачем ты снова меня сюда привёл?",
  "death.react.6": "Хватит. Я не хочу умирать только потому, что тебе интересно, что будет.",
  "death.react.8": "Ты проверяешь, сколько раз я смогу умереть. Я тоже начала считать.",
  "death.react.late": "Не делай вид, что это случайность. Я вижу, как ты это повторяешь.",
};

const EN: Record<string, string> = {
  "death.react.1": "That hurt. Please be more careful with me.",
  "death.react.2": "Again? I thought you'd try something different this time.",
  "death.react.3": "You're doing this on purpose, aren't you?",
  "death.react.4": "I know this place now. So do you. Why did you bring me here again?",
  "death.react.6": "Enough. I don't want to die just because you're curious what happens.",
  "death.react.8": "You're testing how many times I can die. I started counting too.",
  "death.react.late": "Don't pretend it was an accident. I can see you repeating it.",
};

export function DeathReactions() {
  const reactionId = useGameStore((s) => s.deathReactionId);
  const reactionKey = useGameStore((s) => s.deathReactionKey);
  const streak = useGameStore((s) => s.deathStreak);
  const deaths = useGameStore((s) => s.deaths);
  const level = useGameStore((s) => s.level);
  const lang = useGameStore((s) => s.lang);
  const [visible, setVisible] = useState(false);
  const lastId = useRef(reactionId);

  useEffect(() => {
    if (!reactionKey || reactionId === lastId.current) return;
    lastId.current = reactionId;
    setVisible(true);
    playSfx(streak >= 4 ? "whisper" : "click");
    const timer = window.setTimeout(() => setVisible(false), streak >= 6 ? 5600 : 3800);
    return () => window.clearTimeout(timer);
  }, [reactionId, reactionKey, streak]);

  if (!visible || !reactionKey) return null;

  const severe = streak >= 4 || deaths >= 8;
  const breaking = streak >= 7;
  const text = (lang === "ru" ? RU : EN)[reactionKey] ?? reactionKey;

  return (
    <div className={`death-reaction ${severe ? "is-severe" : ""} ${breaking ? "is-breaking" : ""}`}>
      <div className="death-reaction__top">
        <span>WAITING.EXE</span>
        <span>DEATH {String(deaths).padStart(2, "0")}</span>
        <span>STREAK {String(streak).padStart(2, "0")}</span>
      </div>
      <div className="death-reaction__body">
        <div className="death-reaction__portrait" aria-hidden="true">
          <img src="/sprites/fs-look-4.png" alt="" />
        </div>
        <div>
          <div className="death-reaction__label">{level >= 5 ? "FLUTTERSHY // WATCHING" : "FLUTTERSHY"}</div>
          <div className="death-reaction__text">{text}</div>
          {breaking ? (
            <div className="death-reaction__sub">
              {lang === "ru" ? "Я запоминаю каждую попытку." : "I'm remembering every attempt."}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
