import { bridge } from "./bridge";
import { useGameStore } from "@/store/game-store";

/** Connect Phaser/browser bridge events to the React game store. */
export function bindBridge() {
  return bridge.on((e) => {
    const s = useGameStore.getState();
    switch (e.type) {
      case "dialogue":
        s.queueDialogue([{ key: e.key, speaker: e.speaker ?? "fs", look: e.look, nameKey: e.nameKey }]);
        break;
      case "overlay":
        s.showOverlay(e.kind, e.textKey, e.ms);
        break;
      case "note": {
        const first = s.notes.length === 0;
        s.collectNote(e.id);
        s.showToast(e.id === "10" ? "toast.letter" : e.id === "16" ? "toast.gem" : "toast.note");
        if (first) s.queueDialogue([{ key: "d.note", speaker: "fs" }]);
        else if (e.id === "10") s.queueDialogue([{ key: "d.letter", speaker: "fs" }]);
        else if (e.id === "16") s.queueDialogue([{ key: "d.gem", speaker: "fs" }]);
        break;
      }
      case "collect":
        if (e.kind === "butterfly") s.addButterfly();
        if (e.kind === "mark") s.addMark();
        if (e.kind === "letter") {
          s.showToast("toast.letter");
          s.queueDialogue([{ key: "d.letter", speaker: "fs" }]);
        }
        if (e.kind === "gem") {
          s.showToast("toast.gem");
          s.queueDialogue([{ key: "d.gem", speaker: "fs" }]);
        }
        break;
      case "died":
        s.addDeath();
        break;
      case "level-clear":
        s.setLevel(e.level + 1);
        s.setCheckpoint(e.level + 1, 0, 0);
        break;
      case "interlude":
        s.beginInterlude(e.after);
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
      case "whisper":
        s.setWhisper(e.key);
        break;
      case "checkpoint":
        s.setCheckpoint(e.level, e.x, e.y);
        break;
      case "angel-gone":
        s.setAngelGone();
        break;
      case "nudge-dialogue":
        s.nudgeDialogue();
        break;
      default:
        break;
    }
  });
}
