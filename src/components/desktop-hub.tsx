import { useMemo, useState } from "react";
import { t } from "@/game/i18n";
import { playSfx } from "@/game/audio";
import { useGameStore } from "@/store/game-store";

export function DesktopHub() {
  const s = useGameStore();
  const [open, setOpen] = useState(true);
  const lang = s.lang;
  const stage = s.haunt.stage;

  const status = useMemo(() => {
    if (stage >= 6) return lang === "ru" ? "Система не отвечает вам." : "The system no longer answers you.";
    if (stage >= 4) return lang === "ru" ? "Несколько процессов работают без разрешения." : "Several processes are running without permission.";
    if (stage >= 2) return lang === "ru" ? "Обнаружены изменения рабочего стола." : "Desktop changes detected.";
    return lang === "ru" ? "Все системы работают нормально." : "All systems operating normally.";
  }, [lang, stage]);

  if (s.phase !== "desktop" || s.osWindow !== null || s.ending) return null;

  const openWindow = (window: "notes" | "docs" | "recycle" | "comp" | "browser") => {
    playSfx("click");
    s.openWindow(window);
  };

  return (
    <div className={`desktop-hub ${stage >= 4 ? "is-alert" : stage >= 2 ? "is-haunted" : ""}`}>
      <div className="desktop-hub__bar">
        <span className="desktop-hub__title">COTTAGE CONTROL</span>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label={lang === "ru" ? "Свернуть" : "Collapse"}>
          {open ? "—" : "+"}
        </button>
      </div>
      {open ? (
        <div className="desktop-hub__body">
          <p className="desktop-hub__status">
            <span className="desktop-hub__led" />
            {status}
          </p>
          <div className="desktop-hub__actions">
            <button type="button" onClick={() => openWindow("notes")}>
              <span>▤</span>{lang === "ru" ? "Записки" : "Notes"}
            </button>
            <button type="button" onClick={() => openWindow("docs")}>
              <span>▣</span>{lang === "ru" ? "Файлы" : "Files"}
            </button>
            <button type="button" onClick={() => openWindow("recycle")}>
              <span>⌫</span>{lang === "ru" ? "Корзина" : "Recycle"}
            </button>
            <button type="button" onClick={() => openWindow("comp")}>
              <span>▦</span>{lang === "ru" ? "Компьютер" : "Computer"}
            </button>
            <button type="button" onClick={() => openWindow("browser")}>
              <span>◎</span>{lang === "ru" ? "Браузер" : "Browser"}
            </button>
          </div>
          <div className="desktop-hub__meta">
            <span>{lang === "ru" ? "Уровень" : "Level"}: {s.level}</span>
            <span>{lang === "ru" ? "Записки" : "Notes"}: {s.notes.length}/16</span>
            <span>{lang === "ru" ? "Смерти" : "Deaths"}: {s.deaths}</span>
          </div>
          {stage >= 3 ? (
            <p className="desktop-hub__warning">
              {lang === "ru" ? "Некоторые файлы были удалены системой." : "Some files were removed by the system."}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
