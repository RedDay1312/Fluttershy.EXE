import { bridge } from "./bridge";
import { useGameStore } from "@/store/game-store";

/**
 * Reactive horror layer. The game comments on what the player actually does,
 * then escalates into harsher reactions after repeated deaths and late levels.
 */
let cooldownUntil = 0;
const seen = new Set<string>();

function address(key: string, onceKey: string, force = false) {
  const now = Date.now();
  const run = useGameStore.getState().runId;
  const token = `${run}:${onceKey}`;
  if (!force && seen.has(token)) return;
  if (!force && now < cooldownUntil) return;
  seen.add(token);
  cooldownUntil = now + 3200;
  useGameStore.getState().setWhisper(key);
}

function violentAftermath(deaths: number) {
  const s = useGameStore.getState();
  // Escalation is deliberately sparse: aftermath, not constant jump scares.
  if (deaths === 2) {
    s.showOverlay("red", "red.1", 850);
    s.setShake(true);
  } else if (deaths === 4) {
    s.showOverlay("red", "red.4", 1100);
    s.setShake(true);
    address("whisper.5", "death-four-aftermath", true);
  } else if (deaths >= 6 && deaths % 3 === 0) {
    s.showOverlay("black", "black.1", 1400);
    s.setShake(true);
    address("whisper.3", `death-${deaths}-aftermath`, true);
  }
}

bridge.on((event) => {
  const s = useGameStore.getState();

  switch (event.type) {
    case "note": {
      const next = s.notes.length + (s.notes.includes(event.id) ? 0 : 1);
      if (next === 1) address("whisper.3", "first-note");
      else if (next === 3) address("whisper.2", "third-note");
      else if (next === 5) address("whisper.4", "fifth-note");
      else if (next === 7) address("whisper.6", "seventh-note");
      break;
    }
    case "collect":
      if (event.kind === "letter" || event.kind === "gem") {
        address("whisper.3", `collect-${event.kind}`);
      }
      break;
    case "died": {
      const deaths = s.deaths + 1;
      address(deaths >= 3 ? "whisper.4" : "whisper.2", `death-${Math.min(3, deaths)}`);
      violentAftermath(deaths);
      break;
    }
    case "level-clear":
      address(
        event.level >= 6
          ? "whisper.3"
          : event.level >= 4
            ? "whisper.4"
            : event.level === 2
              ? "whisper.5"
              : event.level === 1
                ? "whisper.1"
                : "whisper.2",
        `level-${event.level}`,
      );
      if (event.level >= 4) {
        window.setTimeout(() => {
          const current = useGameStore.getState();
          if (current.phase === "desktop" || current.phase === "playing") {
            current.showOverlay("red", event.level >= 6 ? "red.8" : "red.2", 900);
          }
        }, 1200);
      }
      break;
    case "pause-request":
      address("whisper.6", "pause", true);
      break;
    case "cursor-flee":
      address("whisper.4", "cursor-flee", true);
      break;
    case "ending":
      address("whisper.3", "ending", true);
      break;
    default:
      break;
  }
});

let lastWindow = useGameStore.getState().osWindow;
useGameStore.subscribe((state) => {
  if (state.osWindow === lastWindow) return;
  lastWindow = state.osWindow;

  if (state.osWindow === "browser" && state.notes.length >= 2) {
    address("whisper.2", "open-browser");
  } else if (state.osWindow === "notes" && state.notes.length >= 3) {
    address("whisper.3", "open-notes");
  } else if (state.osWindow === "docs" && state.level >= 4) {
    address("whisper.6", "open-docs");
  }
});
