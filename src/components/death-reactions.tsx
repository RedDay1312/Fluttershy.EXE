import { useEffect, useRef, useState } from "react";
import { playSfx } from "@/game/audio";
import { t } from "@/game/i18n";
import { useGameStore } from "@/store/game-store";

export function DeathReactions() {
  const reactionId = useGameStore((s) => s.deathReactionId);
  const reactionKey = useGameStore((s) => s.deathReactionKey);
  const streak = useGameStore((s) => s.deathStreak);
  const deaths = useGameStore((s) => s.deaths);
  const lang = useGameStore((s) => s.lang);
  const [visible, setVisible] = useState(false);
  const lastId = useRef(reactionId);

  useEffect(() => {
    if (!reactionKey || reactionId === lastId.current) return;
    lastId.current = reactionId;
    setVisible(true);
    playSfx(streak >= 4 ? "whisper" : "click");
    const timer = window.setTimeout(() => setVisible(false), streak >= 6 ? 5200 : 3600);
    return () => window.clearTimeout(timer);
  }, [reactionId, reactionKey, streak]);

  if (!visible || !reactionKey) return null;

  const severe = streak >= 4 || deaths >= 8;
  return (
    <div className={`death-reaction ${severe ? "is-severe" : ""} ${streak >= 7 ? "is-breaking" : ""}`}>
      <div className="death-reaction__line" />
      <div className="death-reaction__meta">
        WAITING.EXE // DEATH {String(deaths).padStart(2, "0")} // STREAK {String(streak).padStart(2, "0")}
      </div>
      <div className="death-reaction__text">{t(lang, reactionKey)}</div>
      {streak >= 7 ? <div className="death-reaction__sub">{lang === "ru" ? "Пожалуйста, перестань проверять." : "Please stop checking."}</div> : null}
    </div>
  );
}
