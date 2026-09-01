import { useEffect, useRef, useState, type HTMLAttributes, type PointerEvent, type ReactNode } from "react";
import { LEVEL_NAMES, t } from "@/game/i18n";
import { unlockAudio, setMusicEnabled, setSfxEnabled, playSfx } from "@/game/audio";
import { installInput, setTouch } from "@/game/input";
import { bindBridge, useGameStore } from "@/store/game-store";
import {
  HauntLayer,
  NotesWindow,
  DocsWindow,
  RecycleWindow,
  BrowserWindow,
  TaskWindow,
  CompWindow,
  FileWindow,
} from "@/components/desktop-haunt";

export function WaitingApp() {
  const hydrate = useGameStore((s) => s.hydrate);
  const phase = useGameStore((s) => s.phase);

  useEffect(() => {
    hydrate();
    const unbind = bindBridge();
    const uninput = installInput();
    const onKey = (e: KeyboardEvent) => {
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

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg">
      {phase === "boot" ? <BootScreen /> : null}
      {phase !== "boot" ? <Desktop /> : null}
      <Overlays />
      <HauntCursor />
      <RotateHint />
    </div>
  );
}

function BootScreen() {
  const lang = useGameStore((s) => s.lang);
  const setPhase = useGameStore((s) => s.setPhase);
  const setLang = useGameStore((s) => s.setLang);
  const [step, setStep] = useState(0);
  const lines = ["boot.line1", "boot.line2", "boot.line3", "boot.line4", "boot.line5", "boot.line6"];

  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => Math.min(s + 1, lines.length)), 380);
    return () => window.clearInterval(id);
  }, [lines.length]);

  const wake = () => {
    unlockAudio();
    playSfx("click");
    setPhase("desktop");
  };

  return (
    <button
      type="button"
      className="flex h-full w-full flex-col items-start justify-center gap-3 bg-bg px-8 text-left font-mono text-sm text-fg md:px-16"
      onClick={wake}
    >
      <p className="font-display text-4xl tracking-wide text-fg md:text-6xl">{t(lang, "app.title")}</p>
      <p className="text-muted">{t(lang, "app.subtitle")}</p>
      <div className="mt-6 space-y-1 text-accent">
        {lines.slice(0, step).map((k) => (
          <p key={k}>{t(lang, k)}</p>
        ))}
        {step >= lines.length ? (
          <p className="mt-4 animate-pulse text-fg">{t(lang, "boot.press")}</p>
        ) : (
          <span className="inline-block h-4 w-2 bg-accent" style={{ animation: "boot-blink 1s step-end infinite" }} />
        )}
      </div>
      <div className="mt-10 flex gap-2">
        <LangChip active={lang === "ru"} onClick={() => setLang("ru")}>
          RU
        </LangChip>
        <LangChip active={lang === "en"} onClick={() => setLang("en")}>
          EN
        </LangChip>
      </div>
    </button>
  );
}

function LangChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      className={
        "rounded-sm border px-3 py-1 text-xs tracking-widest " +
        (active ? "border-accent bg-accent text-accent-fg" : "border-border text-muted")
      }
    >
      {children}
    </span>
  );
}

function Desktop() {
  const s = useGameStore();
  const lang = s.lang;
  const scatter = s.haunt.iconsScatter;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 450);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div
      className={
        "os-desktop relative flex h-full w-full flex-col " +
        (s.corruptDesktop ? "is-corrupt " : "") +
        (s.level >= 5 || s.haunt.stage >= 5 ? "cursor-none " : "")
      }
    >
      <div className="scanlines relative min-h-0 flex-1">
        <HauntLayer />
        <div className={"relative z-10 grid grid-cols-3 gap-6 p-5 sm:grid-cols-none sm:p-8 " + (ready ? "" : "pointer-events-none")}>
          <OsIcon
            img="/ui/exe-icon.png"
            label={t(lang, "desk.exe")}
            jitter={scatter}
            onOpen={() => {
              unlockAudio();
              setMusicEnabled(s.music);
              setSfxEnabled(s.sfx);
              playSfx("click");
              s.launchGame();
            }}
          />
          <OsIcon img="/ui/notepad.png" label={t(lang, "desk.notes")} onOpen={() => s.openWindow("notes")} />
          <OsIcon img="/ui/folder.png" label={t(lang, "desk.docs")} onOpen={() => s.openWindow("docs")} />
          <OsIcon img="/ui/trash.png" label={t(lang, "desk.trash")} onOpen={() => s.openWindow("recycle")} />
          {s.haunt.stage >= 1 ? (
            <OsIcon img="/ui/folder.png" label={t(lang, "desk.computer")} onOpen={() => s.openWindow("comp")} />
          ) : null}
          {s.haunt.files.map((f) => (
            <OsIcon
              key={f.id}
              img={f.kind === "exe" || f.kind === "sys" ? "/ui/exe-icon.png" : f.kind === "img" ? "/sprites/angel.png" : "/ui/notepad.png"}
              label={t(lang, f.labelKey)}
              jitter={scatter}
              onOpen={() => {
                playSfx("click");
                if (f.kind === "folder") s.openWindow("recycle");
                else if (f.id === "cam") s.showOverlay("webcam", "cam.by", 2600);
                else if (f.textKey) s.openDeskFile(t(lang, f.labelKey), t(lang, f.textKey));
                else if (s.haunt.browser) s.openWindow("browser");
                else s.openWindow("notes");
              }}
            />
          ))}
        </div>

        {s.osWindow === "game" || s.phase === "playing" || s.phase === "paused" ? <GameWindow /> : null}
        {s.osWindow === "notes" ? <NotesWindow /> : null}
        {s.osWindow === "docs" ? <DocsWindow /> : null}
        {s.osWindow === "recycle" ? <RecycleWindow /> : null}
        {s.osWindow === "browser" ? <BrowserWindow /> : null}
        {s.osWindow === "task" ? <TaskWindow /> : null}
        {s.osWindow === "comp" ? <CompWindow /> : null}
        {s.osWindow === "file" ? <FileWindow /> : null}
        {s.phase === "ending" && s.ending ? <EndingCard /> : null}
      </div>
      <Taskbar />
    </div>
  );
}

function OsIcon({
  img,
  label,
  onOpen,
  jitter,
}: {
  img?: string;
  label: string;
  onOpen?: () => void;
  jitter?: boolean;
}) {
  return (
    <button
      type="button"
      onDoubleClick={onOpen}
      onClick={onOpen}
      className={
        "flex w-20 flex-col items-center gap-1 text-center text-[11px] text-white [text-shadow:0_1px_2px_#000] " +
        (jitter ? "animate-pulse" : "")
      }
      style={jitter ? { transform: `translate(${(label.length % 5) * 4}px, ${(label.length % 3) * 6}px)` } : undefined}
    >
      {img ? (
        <img src={img} alt="" className="h-12 w-12 object-contain drop-shadow" />
      ) : (
        <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-white/40 bg-white/20 text-lg">
          ·
        </span>
      )}
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function Taskbar() {
  const lang = useGameStore((s) => s.lang);
  const osWindow = useGameStore((s) => s.osWindow);
  const haunt = useGameStore((s) => s.haunt);
  const openWindow = useGameStore((s) => s.openWindow);
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => {
      if (haunt.clockStuck) {
        setClock("3:33");
        return;
      }
      setClock(
        new Date().toLocaleTimeString(lang === "ru" ? "ru-RU" : "en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 10000);
    return () => window.clearInterval(id);
  }, [lang, haunt.clockStuck]);

  return (
    <div className="flex h-10 items-center gap-2 bg-os-task px-1 text-white">
      <span className="rounded-sm bg-os-start px-3 py-1 text-xs font-medium">{t(lang, "desk.start")}</span>
      {osWindow === "game" ? (
        <span className="bg-white/20 px-3 py-1 text-xs">{t(lang, "win.game")}</span>
      ) : null}
      {haunt.taskmgr ? (
        <button type="button" className="bg-white/15 px-3 py-1 text-xs" onClick={() => openWindow("task")}>
          {t(lang, "win.task")}
        </button>
      ) : null}
      {haunt.browser ? (
        <button type="button" className="bg-white/15 px-3 py-1 text-xs" onClick={() => openWindow("browser")}>
          {t(lang, "win.browser")}
        </button>
      ) : null}
      <span className={"ml-auto px-3 font-mono text-xs " + (haunt.clockStuck ? "text-red-200" : "")}>{clock}</span>
    </div>
  );
}

function GameWindow() {
  const s = useGameStore();
  const host = useRef<HTMLDivElement>(null);
  const gameRef = useRef<{ destroy: (remove: boolean) => void } | null>(null);
  const [closeShift, setCloseShift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;
    const el = host.current;
    if (!el) return;
    void (async () => {
      const { createWaitingGame } = await import("@/game/create-game");
      if (cancelled || !host.current) return;
      gameRef.current = createWaitingGame(host.current, s.level);
    })();
    return () => {
      cancelled = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // remount only on a new run — level changes happen inside Phaser
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.runId]);

  const tryClose = () => {
    const result = s.attemptClose();
    if (result === "allowed") {
      s.openWindow(null);
      s.setPhase("desktop");
      return;
    }
    const n = s.closeAttempts;
    const key = n >= 5 ? "d.close.5" : n >= 4 ? "d.close.4" : n >= 3 ? "d.close.3" : n === 2 ? "d.close.2" : "d.close.1";
    s.queueDialogue([{ key, speaker: "fs", look: true }]);
    playSfx("whisper");
  };

  return (
    <div
      className={
        "absolute inset-0 z-30 flex flex-col bg-bg md:inset-3 md:shadow-2xl " +
        (s.windowShake ? "is-shaking" : "")
      }
    >
      <div className="os-titlebar flex items-center gap-2 px-2 py-1 text-xs">
        <span className="flex-1 truncate">
          {t(s.lang, "win.game")} — {LEVEL_NAMES[s.lang][s.level - 1] ?? ""}
        </span>
        <button type="button" className="bg-os-face px-2 text-os-ink" onClick={() => s.setPhase("paused")}>
          {t(s.lang, "ui.pause")}
        </button>
        <button
          type="button"
          className="bg-os-face px-2 text-os-ink"
          style={{ transform: `translate(${closeShift.x}px, ${closeShift.y}px)` }}
          onMouseEnter={() => {
            if (s.level >= 5) {
              setCloseShift({
                x: (Math.random() - 0.5) * 90,
                y: (Math.random() - 0.5) * 24,
              });
            }
          }}
          onClick={tryClose}
        >
          ×
        </button>
      </div>
      <div className="relative min-h-0 flex-1 bg-bg">
        <div ref={host} className="absolute inset-0" />
        <Hud />
        <DialogueBox />
        {s.toast ? (
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-md border border-border bg-surface/90 px-3 py-2 text-xs text-fg">
            {t(s.lang, s.toast)}
          </div>
        ) : null}
        {s.whisper ? (
          <p className="pointer-events-none absolute inset-x-0 top-1/3 z-20 text-center font-display text-2xl text-danger/80">
            {t(s.lang, s.whisper)}
          </p>
        ) : null}
        {!s.sessionStarted ? <TitleCard /> : null}
        {s.phase === "paused" ? <PauseMenu onCloseAttempt={tryClose} /> : null}
        <MobilePads />
      </div>
    </div>
  );
}

function TitleCard() {
  const s = useGameStore();
  const hasSave = s.level > 1 || s.notes.length > 0;
  const tag = s.hauntStage >= 5 ? "title.tag3" : s.hauntStage >= 2 ? "title.tag" : "title.tag2";
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-bg/85 p-6">
      <img src="/sprites/fs-look-4.png" alt="" className="h-32 w-32 object-contain md:h-40 md:w-40" />
      <h1 className="mt-2 font-display text-5xl tracking-wide text-fg md:text-7xl">{t(s.lang, "app.title")}</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-muted">{t(s.lang, tag)}</p>
      <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
        {hasSave ? (
          <MenuBtn
            onClick={() => {
              unlockAudio();
              s.beginSession();
            }}
          >
            {t(s.lang, "ui.continue")} — {LEVEL_NAMES[s.lang][s.level - 1]}
          </MenuBtn>
        ) : null}
        <MenuBtn
          onClick={() => {
            unlockAudio();
            if (hasSave) s.freshRun();
            else s.beginSession();
          }}
        >
          {hasSave ? t(s.lang, "ui.newGame") : t(s.lang, "ui.play")}
        </MenuBtn>
        <div className="flex gap-2">
          <MenuBtn onClick={() => s.setLang(s.lang === "ru" ? "en" : "ru")}>{s.lang.toUpperCase()}</MenuBtn>
          <MenuBtn
            onClick={() => {
              const music = !s.music;
              s.setAudio(music, s.sfx);
              setMusicEnabled(music);
            }}
          >
            {t(s.lang, "ui.music")}: {t(s.lang, s.music ? "ui.on" : "ui.off")}
          </MenuBtn>
        </div>
      </div>
      <p className="mt-6 text-center text-[11px] text-faint">{t(s.lang, "ui.hint")}</p>
    </div>
  );
}

function Hud() {
  const s = useGameStore();
  if (!s.sessionStarted) return null;
  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1 text-xs text-fg">
      <span className="rounded-sm bg-bg/70 px-2 py-1">{LEVEL_NAMES[s.lang][s.level - 1]}</span>
      <span className="rounded-sm bg-bg/70 px-2 py-1">
        {t(s.lang, "ui.notes")} {s.notes.length}/16
      </span>
    </div>
  );
}

function DialogueBox() {
  const s = useGameStore();
  const full = s.dialogue ? t(s.lang, s.dialogue.key) : "";
  const [n, setN] = useState(0);
  const nudge = s.dialogueNudge;

  useEffect(() => {
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

  useEffect(() => {
    if (!s.dialogue || nudge === 0) return;
    if (n < full.length) setN(full.length);
    else s.advanceDialogue(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nudge]);

  if (!s.dialogue) return null;
  const done = n >= full.length;
  const name =
    s.dialogue.speaker === "npc" && s.dialogue.nameKey ? t(s.lang, s.dialogue.nameKey) : "Fluttershy";
  return (
    <button
      type="button"
      className="absolute inset-x-3 bottom-20 z-20 flex gap-3 rounded-lg border border-border bg-surface/95 p-3 text-left md:inset-x-10 md:bottom-8"
      onClick={() => {
        if (!done) setN(full.length);
        else s.advanceDialogue(false);
      }}
    >
      {s.dialogue.look || s.dialogue.speaker === "npc" ? (
        <img
          src={s.dialogue.speaker === "npc" ? "/sprites/fs-horror.png" : "/sprites/fs-look-4.png"}
          alt=""
          className="h-16 w-16 object-contain md:h-20 md:w-20"
        />
      ) : (
        <img src="/sprites/fs-icon.png" alt="" className="h-16 w-16 object-contain md:h-20 md:w-20" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg text-accent">{name}</p>
        <p className="min-h-12 text-sm leading-relaxed text-fg">
          {full.slice(0, n)}
          {!done ? <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-accent" /> : null}
        </p>
        <p className="mt-2 text-[10px] uppercase tracking-widest text-faint">{t(s.lang, "ui.next")}</p>
      </div>
    </button>
  );
}

function PauseMenu({ onCloseAttempt }: { onCloseAttempt: () => void }) {
  const s = useGameStore();
  const [journal, setJournal] = useState(false);
  const toggleFs = () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) void el.requestFullscreen?.();
    else void document.exitFullscreen?.();
  };
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-bg/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-xl">
        <h2 className="font-display text-3xl">{journal ? t(s.lang, "ui.journal") : t(s.lang, "ui.pause")}</h2>
        {journal ? (
          <div className="mt-3 max-h-56 overflow-auto text-sm text-muted">
            {s.notes.length === 0 ? (
              <p>{t(s.lang, "ui.journal.empty")}</p>
            ) : (
              s.notes.map((id) => (
                <p key={id} className="mb-3 whitespace-pre-wrap">
                  {t(s.lang, `note.${id}`)}
                </p>
              ))
            )}
          </div>
        ) : (
          <p className="mt-1 text-sm text-muted">{t(s.lang, "ui.hint")}</p>
        )}
        <div className="mt-5 flex flex-col gap-2">
          {journal ? (
            <MenuBtn onClick={() => setJournal(false)}>{t(s.lang, "ui.back")}</MenuBtn>
          ) : (
            <>
              <MenuBtn onClick={() => s.setPhase("playing")}>{t(s.lang, "ui.resume")}</MenuBtn>
              <MenuBtn onClick={() => setJournal(true)}>{t(s.lang, "ui.journal")}</MenuBtn>
              <MenuBtn onClick={() => s.setLang(s.lang === "ru" ? "en" : "ru")}>
                {t(s.lang, "ui.language")}: {s.lang.toUpperCase()}
              </MenuBtn>
              <MenuBtn
                onClick={() => {
                  const music = !s.music;
                  s.setAudio(music, s.sfx);
                  setMusicEnabled(music);
                }}
              >
                {t(s.lang, "ui.music")}: {t(s.lang, s.music ? "ui.on" : "ui.off")}
              </MenuBtn>
              <MenuBtn
                onClick={() => {
                  const sfx = !s.sfx;
                  s.setAudio(s.music, sfx);
                  setSfxEnabled(sfx);
                }}
              >
                {t(s.lang, "ui.sfx")}: {t(s.lang, s.sfx ? "ui.on" : "ui.off")}
              </MenuBtn>
              <MenuBtn onClick={toggleFs}>{t(s.lang, "ui.fullscreen")}</MenuBtn>
              <MenuBtn onClick={onCloseAttempt}>{t(s.lang, "ui.quit")}</MenuBtn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuBtn({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md border border-border bg-surface-2 px-3 py-2.5 text-left text-sm text-fg hover:border-accent"
    >
      {children}
    </button>
  );
}

function MobilePads() {
  const lang = useGameStore((s) => s.lang);
  const started = useGameStore((s) => s.sessionStarted);
  if (!started) return null;
  const bind = (dir: "left" | "right" | "jump" | "interact") => ({
    onPointerDown: (e: PointerEvent) => {
      e.preventDefault();
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      setTouch(dir, true);
    },
    onPointerUp: () => setTouch(dir, false),
    onPointerCancel: () => setTouch(dir, false),
  });
  return (
    <div className="absolute inset-x-0 bottom-0 z-10 flex justify-between p-3 md:hidden">
      <div className="flex gap-2">
        <Pad label={t(lang, "ui.left")} {...bind("left")} />
        <Pad label={t(lang, "ui.right")} {...bind("right")} />
      </div>
      <div className="flex gap-2">
        <Pad label={t(lang, "ui.interact")} {...bind("interact")} />
        <Pad label={t(lang, "ui.jump")} wide {...bind("jump")} />
      </div>
    </div>
  );
}

function Pad({
  label,
  wide,
  ...rest
}: {
  label: string;
  wide?: boolean;
} & HTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={
        "h-14 rounded-md border border-border bg-surface/80 text-xs uppercase tracking-wider text-fg " +
        (wide ? "w-28" : "w-16")
      }
      {...rest}
    >
      {label}
    </button>
  );
}

function Overlays() {
  const s = useGameStore();
  const o = s.overlay;
  if (o.kind === "none") return null;

  if (o.kind === "bsod") {
    return (
      <button
        type="button"
        className="bsod absolute inset-0 z-50 flex flex-col justify-center gap-4 p-8 text-left"
        onClick={() => s.clearOverlay()}
      >
        <p className="text-xl">{t(s.lang, "bsod.title")}</p>
        <pre className="whitespace-pre-wrap text-sm leading-relaxed">{t(s.lang, "bsod.body")}</pre>
      </button>
    );
  }
  if (o.kind === "freeze") {
    return <FreezeDialog />;
  }
  if (o.kind === "black") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
        <p className="font-display text-2xl tracking-widest text-fg/70">{o.text}</p>
      </div>
    );
  }
  if (o.kind === "glitch") {
    return <div className="glitch-fx pointer-events-none absolute inset-0 z-50" />;
  }
  if (o.kind === "red") {
    return (
      <div className="red-flash absolute inset-0 z-50 flex items-center justify-center text-center">
        <p className="font-display text-4xl md:text-7xl">{o.text}</p>
      </div>
    );
  }
  if (o.kind === "notepad") {
    return (
      <div className="absolute bottom-16 left-6 z-50 w-[min(90vw,360px)]">
        <div className="os-window">
          <div className="os-titlebar px-2 py-1 text-xs">{t(s.lang, "win.notes")}</div>
          <div className="bg-[#fff7d6] p-3 font-mono text-sm text-os-ink">{o.text}</div>
        </div>
      </div>
    );
  }
  if (o.kind === "look" || o.kind === "stare") {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center bg-bg/55">
        <img
          src={o.kind === "stare" ? "/sprites/fs-horror.png" : "/sprites/fs-look-4.png"}
          alt=""
          className="h-[78%] max-h-[560px] object-contain"
          style={{ animation: "look-breathe 1.2s ease-in-out infinite alternate" }}
        />
      </div>
    );
  }
  if (o.kind === "webcam") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
        <div className="overflow-hidden rounded-md border border-danger">
          <div className="bg-danger px-3 py-1 text-xs text-white">{t(s.lang, "cam.on")}</div>
          <img src="/sprites/fs-look-4.png" alt="" className="h-56 w-56 object-cover" />
        </div>
      </div>
    );
  }
  if (o.kind === "windows") {
    return (
      <div className="pointer-events-none absolute inset-0 z-40">
        <FakeDialog x="12%" y="18%" title="explorer.exe" />
        <FakeDialog x="48%" y="36%" title="WARNING" />
        <FakeDialog x="28%" y="58%" title="WAITING.exe" />
      </div>
    );
  }
  return null;
}

function FreezeDialog() {
  const s = useGameStore();
  const [deny, setDeny] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="os-window w-[min(92vw,420px)]">
        <div className="os-titlebar px-2 py-1 text-xs">{t(s.lang, "freeze.title")}</div>
        <div className="whitespace-pre-wrap p-4 text-sm text-os-ink">{t(s.lang, "freeze.body")}</div>
        <div className="flex justify-end gap-2 p-3">
          <button
            type="button"
            className="border border-os-ink/30 bg-os-face px-3 py-1 text-xs text-os-ink"
            onClick={() => s.clearOverlay()}
          >
            {t(s.lang, "freeze.wait")}
          </button>
          <button
            type="button"
            className="border border-os-ink/30 bg-os-face px-3 py-1 text-xs text-os-ink"
            style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
            onMouseEnter={() =>
              setPos({ x: (Math.random() - 0.5) * 140, y: (Math.random() - 0.5) * 50 })
            }
            onClick={() => setDeny(true)}
          >
            {t(s.lang, "freeze.kill")}
          </button>
        </div>
        {deny ? <p className="px-4 pb-3 text-sm text-danger">{t(s.lang, "freeze.deny")}</p> : null}
      </div>
    </div>
  );
}

function FakeDialog({ x, y, title }: { x: string; y: string; title: string }) {
  return (
    <div className="os-window pointer-events-auto absolute w-56" style={{ left: x, top: y }}>
      <div className="os-titlebar px-2 py-1 text-xs">{title}</div>
      <div className="p-3 text-xs text-os-ink">The process cannot be closed.</div>
    </div>
  );
}

function EndingCard() {
  const s = useGameStore();
  if (!s.ending) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-bg/90 p-6">
      <div className="max-w-lg text-center">
        {s.ending === "merge" || s.ending === "loop" ? (
          <img src="/sprites/fs-look-4.png" alt="" className="mx-auto mb-4 h-40 w-40 object-contain" />
        ) : s.ending === "kind" ? (
          <img src="/sprites/angel.png" alt="" className="mx-auto mb-4 h-24 w-24 object-contain" />
        ) : null}
        <h2 className="font-display text-4xl text-fg">{t(s.lang, `end.${s.ending}.title`)}</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">{t(s.lang, `end.${s.ending}.body`)}</p>
        <button
          type="button"
          className="mt-8 rounded-md border border-border bg-surface px-4 py-2 text-sm"
          onClick={() => s.resetRun()}
        >
          {t(s.lang, "end.again")}
        </button>
      </div>
    </div>
  );
}

function HauntCursor() {
  const level = useGameStore((s) => s.level);
  const haunt = useGameStore((s) => s.haunt);
  const flee = useGameStore((s) => s.cursorFlee);
  const phase = useGameStore((s) => s.phase);
  const [pos, setPos] = useState({ x: 40, y: 40 });
  useEffect(() => {
    const m = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", m);
    return () => window.removeEventListener("mousemove", m);
  }, []);
  if ((level < 5 && haunt.stage < 5) || phase === "boot") return null;
  return (
    <img
      src="/sprites/fs-icon.png"
      alt=""
      className="pointer-events-none fixed z-[70] h-8 w-8 object-contain"
      style={{
        left: pos.x + 10,
        top: pos.y + 10,
        transform: flee ? "translate(70px, -36px)" : undefined,
        transition: "transform 0.4s ease",
      }}
    />
  );
}

function RotateHint() {
  const lang = useGameStore((s) => s.lang);
  return (
    <div className="rotate-hint pointer-events-none absolute inset-0 z-[60] hidden items-center justify-center bg-bg">
      <p className="px-8 text-center font-display text-2xl text-fg">{t(lang, "ui.rotate")}</p>
    </div>
  );
}
