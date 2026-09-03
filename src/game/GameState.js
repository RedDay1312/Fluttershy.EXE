export const GameState = {
  chapterIndex: 0,
  totalShards: 0,
  chapterShards: 0,
  deaths: 0,
  fear: 12,
  bestEnding: null,
  completedChapters: 0,
};

export function resetRun() {
  GameState.chapterIndex = 0;
  GameState.totalShards = 0;
  GameState.chapterShards = 0;
  GameState.deaths = 0;
  GameState.fear = 12;
  GameState.bestEnding = null;
  GameState.completedChapters = 0;
}

export function startChapter(index) {
  GameState.chapterIndex = index;
  GameState.chapterShards = 0;
  GameState.fear = 12;
}

export function addShard() {
  GameState.chapterShards += 1;
  GameState.totalShards += 1;
  GameState.fear = Math.max(0, GameState.fear - 12);
}

export function loseChapterProgress() {
  GameState.totalShards = Math.max(0, GameState.totalShards - GameState.chapterShards);
  GameState.chapterShards = 0;
  GameState.fear = 12;
}

export function completeChapter() {
  GameState.completedChapters = Math.max(GameState.completedChapters, GameState.chapterIndex + 1);
}
