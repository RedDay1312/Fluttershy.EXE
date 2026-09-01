import { useEffect, useState, type ReactNode } from "react";
import { t } from "@/game/i18n";
import { playSfx } from "@/game/audio";
import { useGameStore } from "@/store/game-store";

export function HauntLayer() {
  const s = useGameStore();
  const h = s.haunt;
  if (h.stage <= 0 && !s.interludeActive) return null;
  return (
    <>
      {h.eyes ? <WallpaperEyes /> : null}
      {h.bleed ? <BleedDrips /> : null}
      {h.sticky.map((key, i) => (
        <Sticky key={key} text={t(s.lang, key)} i={i} />
      ))}
      {h.ponyWalk || s.desktopPony ? <WalkingPony /> : null}
      {h.webcam ? <WebcamLed /> : null}
      {s.interludeActive ? <InterludeBanner /> : null}
    </>
  );
}

function WallpaperEyes() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {[18, 42, 70, 85].map((x, i) => (
        <img
          key={i}
          src="/sprites/eyes.png"
          alt=""
          className="absolute h-8 w-16 opacity-70"
          style={{
            left: `${x}%`,
            top: `${20 + i * 14}%`,
            animation: `look-breathe ${2 + i * 0.4}s ease-in-out infinite alternate`,
          }}
        />
      ))}
    </div>
  );
}

function BleedDrips() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] h-40 overflow-hidden">
      {[12, 28, 47, 63, 81].map((x, i) => (
        <span
          key={i}
          className="absolute top-0 w-1 rounded-b-full bg-danger/80"
          style={{
            left: `${x}%`,
            height: `${40 + (i % 3) * 22}px`,
            animation: `drip-fall ${3 + i}s ease-in infinite`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}

function Sticky({ text, i }: { text: string; i: number }) {
  const rot = [-6, 4, -2, 7, -8, 3][i % 6];
  const left = [62, 74, 55, 80, 48, 68][i % 6];
  const top = [12, 28, 44, 18, 36, 52][i % 6];
  return (
    <div
      className="absolute z-[8] w-36 bg-[#f5e6a3] p-2 font-mono text-[11px] leading-snug text-os-ink shadow-md"
      style={{ left: `${left}%`, top: `${top}%`, transform: `rotate(${rot}deg)` }}
    >
      {text}
    </div>
  );
}

function WalkingPony() {
  return (
    <img
      src="/sprites/fs-look-4.png"
      alt=""
      className="pointer-events-none absolute bottom-12 z-[9] h-28 w-28 object-contain drop-shadow-2xl md:h-40 md:w-40"
      style={{ animation: "pony-cross 18s linear infinite" }}
    />
  );
}

function WebcamLed() {
  const lang = useGameStore((s) => s.lang);
  return (
    <div className="absolute right-3 top-3 z-[12] flex items-center gap-2 rounded-sm bg-black/70 px-2 py-1 text-[10px] text-fg">
      <span className="h-2 w-2 rounded-full bg-danger" style={{ animation: "boot-blink 1s step-end infinite" }} />
      <span>
        {t(lang, "cam.on")} · {t(lang, "cam.by")}
      </span>
    </div>
  );
}

function InterludeBanner() {
  const lang = useGameStore((s) => s.lang);
  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 z-[15] flex flex-col items-center text-center">
      <p className="font-display text-3xl text-fg drop-shadow">{t(lang, "inter.title")}</p>
      <p className="mt-1 text-sm text-muted">{t(lang, "inter.body")}</p>
      <p className="mt-2 text-[11px] uppercase tracking-widest text-accent">{t(lang, "inter.open")}</p>
    </div>
  );
}

export function Chrome({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose?: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={
        "os-window absolute z-20 flex flex-col overflow-hidden " +
        (wide
          ? "inset-2 md:inset-4"
          : "left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2")
      }
    >
      <div className="os-titlebar flex items-center gap-2 px-2 py-1 text-xs">
        <span className="flex-1 truncate font-medium">{title}</span>
        {onClose ? (
          <button type="button" className="bg-os-face px-2 text-os-ink" onClick={onClose}>
            ×
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function NotesWindow() {
  const s = useGameStore();
  const latest = s.haunt.typingKey ? t(s.lang, s.haunt.typingKey) : null;
  return (
    <Chrome title={t(s.lang, "win.notes")} onClose={() => s.openWindow(null)}>
      <div className="max-h-[50vh] overflow-auto bg-[#fff7d6] p-4 font-mono text-sm text-os-ink">
        {latest ? (
          s.interludeActive ? (
            <TypeLines text={latest} />
          ) : (
            <p className="mb-4 whitespace-pre-wrap">{latest}</p>
          )
        ) : null}
        {!latest && s.notes.length === 0 ? (
          <p className="text-faint">{t(s.lang, "desk.save.empty")}</p>
        ) : (
          s.notes.map((id) => (
            <p key={id} className="mb-4 whitespace-pre-wrap">
              {t(s.lang, `note.${id}`)}
            </p>
          ))
        )}
      </div>
    </Chrome>
  );
}

function TypeLines({ text }: { text: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        if (v % 3 === 0) playSfx("type");
        return v + 1;
      });
    }, 28);
    return () => window.clearInterval(id);
  }, [text]);
  return <p className="whitespace-pre-wrap">{text.slice(0, n)}</p>;
}

export function DocsWindow() {
  const s = useGameStore();
  const labelKey =
    s.saveLabel === "wait"
      ? "desk.save.wait"
      : s.saveLabel === "empty"
        ? "desk.save.empty"
        : s.saveLabel === "fog"
          ? "desk.save.fog"
          : s.saveLabel === "blood"
            ? "desk.save.blood"
            : "desk.save.ok";
  return (
    <Chrome title={t(s.lang, "win.docs")} onClose={() => s.openWindow(null)}>
      <div className="bg-white p-4 text-sm text-os-ink">
        <p className="font-mono">{t(s.lang, "desk.save")}</p>
        <p className="mt-2 text-danger">{t(s.lang, labelKey)}</p>
        <p className="mt-4 text-faint">
          {t(s.lang, "ui.level")} {s.level} · {t(s.lang, "ui.notes")} {s.notes.length}/16
        </p>
      </div>
    </Chrome>
  );
}

export function RecycleWindow() {
  const s = useGameStore();
  return (
    <Chrome title={t(s.lang, "win.recycle")} onClose={() => s.openWindow(null)}>
      <div className="max-h-[46vh] bg-white p-3 text-sm text-os-ink">
        {s.haunt.recycle.length === 0 ? (
          <p className="text-faint">{t(s.lang, "rec.empty")}</p>
        ) : (
          s.haunt.recycle.map((name) => (
            <div key={name} className="mb-2 flex items-center justify-between gap-2 border-b border-black/10 py-1">
              <span className="font-mono text-xs">{name}</span>
              <button
                type="button"
                className="border border-os-ink/30 px-2 py-0.5 text-[10px]"
                onClick={() => {
                  playSfx("whisper");
                  s.tryRestore(name);
                }}
              >
                {t(s.lang, "rec.restore")}
              </button>
            </div>
          ))
        )}
        {s.restoreFail ? <p className="mt-2 text-danger">{t(s.lang, "rec.fail")}</p> : null}
      </div>
    </Chrome>
  );
}

export function BrowserWindow() {
  const s = useGameStore();
  const [q, setQ] = useState(0);
  const queries = [
    ["browser.q", "browser.a"],
    ["browser.q2", "browser.a2"],
    ["browser.q3", "browser.a3"],
  ] as const;
  const cur = queries[q % queries.length];
  return (
    <Chrome title={t(s.lang, "win.browser")} onClose={() => s.openWindow(null)}>
      <div className="bg-white text-os-ink">
        <div className="flex items-center gap-2 border-b border-black/10 bg-[#e8e8e8] px-2 py-1 text-xs">
          <span className="rounded-sm bg-white px-2 py-0.5 font-mono">cottage.net</span>
        </div>
        <div className="p-4">
          <p className="font-mono text-sm">🔎 {t(s.lang, cur[0])}</p>
          <p className="mt-3 text-sm text-danger">{t(s.lang, cur[1])}</p>
          <button
            type="button"
            className="mt-4 border border-os-ink/30 px-2 py-1 text-xs"
            onClick={() => {
              playSfx("click");
              setQ((n) => n + 1);
            }}
          >
            →
          </button>
        </div>
      </div>
    </Chrome>
  );
}

export function TaskWindow() {
  const s = useGameStore();
  const [deny, setDeny] = useState(false);
  const rows = ["task.1", "task.2", "task.3", "task.4"];
  return (
    <Chrome title={t(s.lang, "win.task")} onClose={() => s.openWindow(null)}>
      <div className="bg-white p-3 text-xs text-os-ink">
        {rows.map((k) => (
          <div key={k} className="mb-1 flex items-center justify-between border-b border-black/10 py-1">
            <span className="font-mono">{t(s.lang, k)}</span>
            <button
              type="button"
              className="border border-os-ink/30 px-2 py-0.5"
              onClick={() => {
                playSfx("stinger");
                setDeny(true);
              }}
            >
              {t(s.lang, "task.end")}
            </button>
          </div>
        ))}
        {deny ? <p className="mt-2 text-danger">{t(s.lang, "task.deny")}</p> : null}
      </div>
    </Chrome>
  );
}

export function CompWindow() {
  const s = useGameStore();
  return (
    <Chrome title={t(s.lang, "win.comp")} onClose={() => s.openWindow(null)}>
      <div className="bg-white p-4 font-mono text-xs text-os-ink">
        <p>{t(s.lang, "comp.drive")}</p>
        <p className="mt-2 text-danger">{t(s.lang, "comp.f")}</p>
        <p className="mt-4 text-faint">{t(s.lang, "comp.users")}</p>
      </div>
    </Chrome>
  );
}

export function FileWindow() {
  const s = useGameStore();
  if (!s.openFile) return null;
  return (
    <Chrome title={s.openFile.title} onClose={() => s.openWindow(null)}>
      <div className="max-h-[46vh] overflow-auto bg-[#fff7d6] p-4 font-mono text-sm whitespace-pre-wrap text-os-ink">
        {s.openFile.body}
      </div>
    </Chrome>
  );
}
