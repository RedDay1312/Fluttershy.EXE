import { setStoryFlag, advanceStory, type StoryFlag } from "./story-state";
import { bridge } from "./bridge";
import { playHorrorSfx, hushMusic } from "./audio";
import "./horror-cutscenes";
import "./player-address";

export type HorrorBeat={level:number;fear:number;event:"glitch"|"flicker"|"distort"|"shake"|"black"|"stare";ms?:number;flag?:StoryFlag};
const BEATS:HorrorBeat[]=[
{level:1,fear:1,event:"glitch",ms:900,flag:"first_break"},
{level:2,fear:2,event:"flicker",ms:1200,flag:"saw_watcher"},
{level:3,fear:3,event:"glitch",ms:1500,flag:"system_revealed"},
{level:4,fear:4,event:"distort",ms:1900,flag:"saw_core"},
{level:5,fear:5,event:"stare",ms:2200},
{level:6,fear:6,event:"distort",ms:2600,flag:"body_broken"},
{level:7,fear:7,event:"black",ms:3000,flag:"final_break"},
];
let last=-1;

function escalationSound(level:number) {
  if (level <= 1) { playHorrorSfx("rustle"); return; }
  if (level === 2) { playHorrorSfx("knock"); playHorrorSfx("steps"); return; }
  if (level === 3) { playHorrorSfx("breath"); playHorrorSfx("heartbeat"); return; }
  if (level === 4) { hushMusic(1.2); playHorrorSfx("impact"); playHorrorSfx("heartbeat"); return; }
  if (level === 5) { hushMusic(1.8); playHorrorSfx("breath"); playHorrorSfx("heartbeat"); return; }
  if (level === 6) { hushMusic(2.4); playHorrorSfx("impact"); playHorrorSfx("scream"); playHorrorSfx("heartbeat"); return; }
  hushMusic(3); playHorrorSfx("scream"); playHorrorSfx("impact"); playHorrorSfx("heartbeat");
}

bridge.on(e=>{
 if(e.type!=="level-clear"||e.level===last)return;
 last=e.level;
 const b=BEATS.find(x=>x.level===e.level);if(!b)return;
 advanceStory(e.level,b.fear);if(b.flag)setStoryFlag(b.flag);
 escalationSound(e.level);
 window.setTimeout(()=>{
  if(b.event==="black")bridge.emit({type:"overlay",kind:"black",textKey:"black.2",ms:b.ms});
  else if(b.event==="stare")bridge.emit({type:"overlay",kind:"stare",ms:b.ms});
  else if(b.event==="glitch"||b.event==="distort")bridge.emit({type:"overlay",kind:"glitch",ms:b.ms});
  else bridge.emit({type:"shake-window"});
 },350);
});
export function resetHorrorDirector(){last=-1;}
