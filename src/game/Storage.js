const SAVE_KEY = 'fluttershy-exe-clean-v1';

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data?.version !== 1) return null;
    return data;
  } catch (error) {
    console.warn('[Fluttershy.EXE] save read failed:', error);
    return null;
  }
}

export function saveGame(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      version: 1,
      chapterIndex: state.chapterIndex,
      totalShards: state.totalShards,
      deaths: state.deaths,
      bestEnding: state.bestEnding,
      completedChapters: state.completedChapters,
    }));
    return true;
  } catch (error) {
    console.warn('[Fluttershy.EXE] save write failed:', error);
    return false;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
