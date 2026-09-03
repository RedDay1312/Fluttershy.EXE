const DEFAULT = Object.freeze({ chapter: 0, memories: 0, deaths: 0, fear: 10, ending: null, flags: {} });
export const GameState = structuredClone(DEFAULT);

export function resetGame() {
  Object.assign(GameState, structuredClone(DEFAULT));
}
export function beginChapter(index) {
  GameState.chapter = index;
  GameState.memories = 0;
  GameState.fear = Math.max(8, Math.min(35, 12 + index * 7));
}
export function collectMemory() {
  GameState.memories += 1;
  GameState.fear = Math.max(0, GameState.fear - 9);
}
export function onDeath() {
  GameState.deaths += 1;
  GameState.memories = 0;
  GameState.fear = Math.min(100, 30 + GameState.deaths * 4);
}
export function markEnding(name) { GameState.ending = name; }
export function setFlag(key, value = true) { GameState.flags[key] = value; }
export function getSnapshot() { return structuredClone(GameState); }
