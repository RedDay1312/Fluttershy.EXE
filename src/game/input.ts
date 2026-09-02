export type Actions = {
  moveX: number;
  jump: boolean;
  jumpPressed: boolean;
  down: boolean;
  pause: boolean;
  interact: boolean;
};

const held = new Set<string>();
let injected: string[] | null = null;
let prevJump = false;
let prevPause = false;
let prevInteract = false;
let installedCleanup: (() => void) | null = null;

const GAME_CODES = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "KeyA",
  "KeyD",
  "KeyW",
  "KeyS",
  "KeyE",
  "KeyF",
  "Escape",
]);

function activeCodes(): Set<string> {
  if (injected) return new Set(injected);
  return held;
}

function resetEdges() {
  prevJump = false;
  prevPause = false;
  prevInteract = false;
}

function clearPhysicalInput() {
  held.clear();
  resetEdges();
}

export function installInput(target: Window | Document = window) {
  // Re-installing input must not stack another set of global listeners.
  // This matters when the game scene is recreated or hot-reloaded.
  installedCleanup?.();
  installedCleanup = null;
  clearInput();

  const down = (e: KeyboardEvent) => {
    if (GAME_CODES.has(e.code)) e.preventDefault();
    held.add(e.code);
  };
  const up = (e: KeyboardEvent) => {
    held.delete(e.code);
  };
  const clear = () => {
    clearPhysicalInput();
  };
  const visibility = () => {
    // Browsers may omit keyup when a tab/window loses focus. Clear both
    // physical and injected controls so movement cannot remain stuck.
    if (document.hidden) {
      held.clear();
      injected = null;
      resetEdges();
    } else {
      clearPhysicalInput();
    }
  };

  target.addEventListener("keydown", down as EventListener);
  target.addEventListener("keyup", up as EventListener);
  window.addEventListener("blur", clear);
  window.addEventListener("focus", resetEdges);
  document.addEventListener("visibilitychange", visibility);

  const cleanup = () => {
    target.removeEventListener("keydown", down as EventListener);
    target.removeEventListener("keyup", up as EventListener);
    window.removeEventListener("blur", clear);
    window.removeEventListener("focus", resetEdges);
    document.removeEventListener("visibilitychange", visibility);
    clearInput();
    if (installedCleanup === cleanup) installedCleanup = null;
  };
  installedCleanup = cleanup;
  return cleanup;
}

export function setInjectedKeys(codes: string[] | null) {
  injected = codes;
  resetEdges();
}

export function setTouch(dir: "left" | "right" | "jump" | "down" | "interact", on: boolean) {
  const map = {
    left: "ArrowLeft",
    right: "ArrowRight",
    jump: "Space",
    down: "ArrowDown",
    interact: "KeyE",
  } as const;
  if (on) held.add(map[dir]);
  else held.delete(map[dir]);
}

export function readActions(): Actions {
  const keys = activeCodes();
  let moveX = 0;
  if (keys.has("KeyA") || keys.has("ArrowLeft")) moveX -= 1;
  if (keys.has("KeyD") || keys.has("ArrowRight")) moveX += 1;
  const jumpHeld = keys.has("Space") || keys.has("KeyW") || keys.has("ArrowUp");
  const pauseHeld = keys.has("Escape");
  const interactHeld = keys.has("KeyE") || keys.has("KeyF");
  const jumpPressed = jumpHeld && !prevJump;
  const pause = pauseHeld && !prevPause;
  const interact = interactHeld && !prevInteract;
  prevJump = jumpHeld;
  prevPause = pauseHeld;
  prevInteract = interactHeld;
  return {
    moveX,
    jump: jumpHeld,
    jumpPressed,
    down: keys.has("KeyS") || keys.has("ArrowDown"),
    pause,
    interact,
  };
}

export function clearInput() {
  held.clear();
  injected = null;
  resetEdges();
}
