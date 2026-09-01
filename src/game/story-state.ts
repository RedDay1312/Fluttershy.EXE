export const STORY_VERSION = 2;
export type StoryFlag =
  | "noticed_cottage"
  | "first_break"
  | "saw_watcher"
  | "system_revealed"
  | "friends_lost"
  | "survived_freeze"
  | "crossed_void"
  | "saw_core"
  | "cursor_rejected"
  | "desktop_seen"
  | "body_broken"
  | "final_break"
  | "final_gate";

export type StoryState = {
  version: number;
  flags: Record<StoryFlag, boolean>;
  chapter: number;
  fear: number;
  mercy: number;
  truth: number;
};

const KEY = "waiting.exe.story.v2";
const FLAGS: StoryFlag[] = [
  "noticed_cottage",
  "first_break",
  "saw_watcher",
  "system_revealed",
  "friends_lost",
  "survived_freeze",
  "crossed_void",
  "saw_core",
  "cursor_rejected",
  "desktop_seen",
  "body_broken",
  "final_break",
  "final_gate",
];

export function defaultStory(): StoryState {
  return {
    version: STORY_VERSION,
    flags: Object.fromEntries(FLAGS.map((flag) => [flag, false])) as Record<StoryFlag, boolean>,
    chapter: 1,
    fear: 0,
    mercy: 0,
    truth: 0,
  };
}

function isFreshSaveMarker(): boolean {
  try {
    const raw = localStorage.getItem("waiting.exe.save.v4");
    if (!raw) return true;
    const save = JSON.parse(raw) as { level?: number; notes?: unknown[]; seenIntro?: boolean };
    return save.level === 1 && Array.isArray(save.notes) && save.notes.length === 0 && save.seenIntro === false;
  } catch {
    return true;
  }
}

export function loadStory(): StoryState {
  try {
    // New Game writes a clean level-1 save before the first story trigger.
    // Treat that marker as the start of a brand-new story and discard prior flags.
    if (isFreshSaveMarker()) {
      const fresh = defaultStory();
      localStorage.setItem(KEY, JSON.stringify(fresh));
      localStorage.removeItem("waiting.exe.story.v1");
      return fresh;
    }

    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultStory();
    const saved = JSON.parse(raw) as Partial<StoryState>;
    const base = defaultStory();
    return {
      ...base,
      ...saved,
      version: STORY_VERSION,
      flags: { ...base.flags, ...(saved.flags ?? {}) },
    };
  } catch {
    return defaultStory();
  }
}

export function saveStory(state: StoryState) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...state, version: STORY_VERSION }));
  } catch {
    /* private mode */
  }
}

export function setStoryFlag(flag: StoryFlag, value = true) {
  const state = loadStory();
  state.flags[flag] = value;
  saveStory(state);
  return state;
}

export function advanceStory(chapter: number, fear: number) {
  const state = loadStory();
  state.chapter = Math.max(state.chapter, chapter);
  state.fear = Math.max(state.fear, fear);
  saveStory(state);
  return state;
}

export function recordMercy(amount = 1) {
  const state = loadStory();
  state.mercy = Math.max(0, state.mercy + amount);
  saveStory(state);
  return state;
}

export function recordTruth(amount = 1) {
  const state = loadStory();
  state.truth = Math.max(0, state.truth + amount);
  saveStory(state);
  return state;
}

export function resetStory() {
  const state = defaultStory();
  saveStory(state);
  return state;
}

export function endingFromStory(): "kind" | "escape" | "merge" | "loop" {
  const state = loadStory();
  const flags = state.flags;
  const truth = [
    flags.noticed_cottage,
    flags.system_revealed,
    flags.survived_freeze,
    flags.saw_core,
    flags.desktop_seen,
  ].filter(Boolean).length;
  const mercy = [
    flags.noticed_cottage,
    flags.cursor_rejected,
    flags.survived_freeze,
    flags.crossed_void,
  ].filter(Boolean).length;

  if (flags.final_gate && truth >= 4 && mercy >= 3) return "kind";
  if (flags.final_gate && mercy >= 2) return "escape";
  if (flags.final_break && state.fear >= 5) return "merge";
  return "loop";
}
