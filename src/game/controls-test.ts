import * as Phaser from "phaser";
import type { Pony } from "./player";
import { setInjectedKeys } from "./input";

export function installControlsTest(getPony: () => Pony | null) {
  window.__controlsTest = {
    getYaw: () => {
      const p = getPony();
      if (!p) return 0;
      return p.facing < 0 ? 0.4 : 0;
    },
    getSpeed: () => {
      const p = getPony();
      if (!p) return 0;
      const b = p.sprite.body as Phaser.Physics.Arcade.Body | null;
      if (!b) return 0;
      return Math.max(Math.abs(b.velocity.x), Math.abs(b.velocity.y));
    },
    setKeys: (codes: string[]) => {
      setInjectedKeys(codes);
    },
    setSteer: (v: number) => {
      if (v < -0.2) setInjectedKeys(["KeyA"]);
      else if (v > 0.2) setInjectedKeys(["KeyD"]);
      else setInjectedKeys([]);
    },
  };
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      setKeys?: (codes: string[]) => void;
      setSteer?: (v: number) => void;
    };
  }
}
