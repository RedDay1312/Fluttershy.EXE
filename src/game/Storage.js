const KEY = 'fluttershy-exe-reborn-save';
export function readSave() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Save read failed', error);
    return null;
  }
}
export function writeSave(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (error) { console.warn('Save write failed', error); return false; }
}
export function wipeSave() {
  try { localStorage.removeItem(KEY); return true; }
  catch { return false; }
}
