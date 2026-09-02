import { playHorrorSfx, playSfx } from "./audio";
import { clearInput } from "./input";
import { LORE_NOTES } from "./lore-notes";

export type OverlayKind =
  | "none" | "bsod" | "red" | "notepad" | "freeze" | "look" | "glitch"
  | "windows" | "black" | "stare" | "webcam";

export type BridgeEvent =
  | { type: "dialogue"; key: string; speaker?: "fs" | "system" | "npc"; look?: boolean; nameKey?: string }
  | { type: "overlay"; kind: OverlayKind; textKey?: string; ms?: number }
  | { type: "hud"; notes: number; butterflies: number; level: number }
  | { type: "level-clear"; level: number }
  | { type: "interlude"; after: number } | { type: "ending" } | { type: "pause-request" }
  | { type: "loaded" } | { type: "died" } | { type: "note"; id: string }
  | { type: "collect"; kind: "butterfly" | "flower" | "letter" | "gem" | "mark" }
  | { type: "cursor-flee" } | { type: "desktop-pony" } | { type: "toast"; key: string }
  | { type: "shake-window" } | { type: "whisper"; key: string }
  | { type: "checkpoint"; level: number; x: number; y: number }
  | { type: "angel-gone" } | { type: "nudge-dialogue" };

type Handler = (e: BridgeEvent) => void;
const handlers = new Set<Handler>();
let checkpointBanner: HTMLDivElement | null = null;
let checkpointTimer: number | null = null;
let horrorBusy = false;
let lastOrganicHorror = 0;
let loreNoteOpen = false;

function showCheckpointBanner() {
  if (typeof document === "undefined") return;
  if (checkpointTimer) window.clearTimeout(checkpointTimer);
  checkpointBanner?.remove();
  const el = document.createElement("div"); checkpointBanner = el; el.textContent = "CHECKPOINT SAVED";
  Object.assign(el.style, { position:"fixed", left:"50%", top:"18%", transform:"translate(-50%, -8px) scale(.96)", zIndex:"9999", padding:"10px 18px", border:"1px solid rgba(255,235,190,.75)", background:"rgba(12,14,18,.9)", color:"#fff1cf", fontFamily:"IBM Plex Sans, sans-serif", fontSize:"13px", fontWeight:"700", letterSpacing:".18em", textShadow:"0 1px 8px rgba(0,0,0,.8)", boxShadow:"0 8px 30px rgba(0,0,0,.35)", opacity:"0", transition:"opacity 140ms ease, transform 180ms ease", pointerEvents:"none" });
  document.body.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity="1"; el.style.transform="translate(-50%, 0) scale(1)"; });
  checkpointTimer = window.setTimeout(() => { if (!checkpointBanner) return; checkpointBanner.style.opacity="0"; checkpointBanner.style.transform="translate(-50%, -4px) scale(.98)"; window.setTimeout(() => { checkpointBanner?.remove(); checkpointBanner=null; },180); },1200);
}

function horrorLayer(ms: number) {
  if (typeof document === "undefined") return null;
  const el = document.createElement("div"); Object.assign(el.style,{position:"fixed",inset:"0",zIndex:"10000",pointerEvents:"none",overflow:"hidden"}); document.body.appendChild(el); window.setTimeout(()=>el.remove(),ms); return el;
}

function showLoreNote(id: string) {
  if (typeof document === "undefined" || loreNoteOpen) return;
  const note = LORE_NOTES.find((n) => n.id === id);
  if (!note) return;
  loreNoteOpen = true;
  clearInput();

  const overlay = document.createElement("div");
  const paper = document.createElement("div");
  const header = document.createElement("div");
  const title = document.createElement("div");
  const body = document.createElement("div");
  const footer = document.createElement("div");
  const close = document.createElement("button");

  Object.assign(overlay.style, {
    position:"fixed", inset:"0", zIndex:"12000", display:"flex", alignItems:"center", justifyContent:"center",
    padding:"clamp(18px, 5vw, 70px)", background:"rgba(2,3,5,.86)", backdropFilter:"blur(5px)",
    opacity:"0", transition:"opacity 180ms ease", cursor:"default",
  });
  overlay.dataset.loreNote = "true";

  Object.assign(paper.style, {
    position:"relative", width:"min(820px, 92vw)", maxHeight:"min(760px, 88vh)", overflow:"auto",
    padding:"clamp(28px, 5vw, 56px)", background:"#eee7d4", color:"#211f1a",
    boxShadow:"0 24px 80px rgba(0,0,0,.65), 0 0 0 1px rgba(255,255,255,.12)",
    transform:"translateY(18px) scale(.97) rotate(-.35deg)", transition:"transform 220ms cubic-bezier(.18,.8,.2,1)",
    fontFamily:"Georgia, 'Times New Roman', serif",
  });
  Object.assign(header.style, { display:"flex", alignItems:"center", justifyContent:"space-between", gap:"20px", borderBottom:"1px solid rgba(40,35,25,.22)", paddingBottom:"14px", marginBottom:"28px" });
  Object.assign(title.style, { fontSize:"clamp(18px, 3vw, 27px)", fontWeight:"700", letterSpacing:".02em" });
  Object.assign(body.style, { fontSize:"clamp(16px, 2vw, 21px)", lineHeight:"1.8", whiteSpace:"pre-wrap", minHeight:"180px" });
  Object.assign(footer.style, { marginTop:"30px", paddingTop:"14px", borderTop:"1px solid rgba(40,35,25,.15)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"15px", fontFamily:"IBM Plex Sans, sans-serif", fontSize:"12px", color:"rgba(33,31,26,.62)", letterSpacing:".08em", textTransform:"uppercase" });
  Object.assign(close.style, { border:"1px solid rgba(33,31,26,.35)", background:"rgba(255,255,255,.3)", color:"#211f1a", padding:"8px 14px", fontFamily:"inherit", fontSize:"12px", cursor:"pointer" });

  const number = LORE_NOTES.findIndex((n) => n.id === id) + 1;
  title.textContent = note.title;
  body.textContent = note.body;
  footer.append(document.createTextNode(`FLUTTERSHY.EXE  •  ${String(number).padStart(2, "0")} / ${LORE_NOTES.length}`));
  close.textContent = "ЗАКРЫТЬ  [E]";
  header.append(title, close);
  paper.append(header, body, footer);
  overlay.appendChild(paper);
  document.body.appendChild(overlay);

  const finish = () => {
    if (!loreNoteOpen) return;
    loreNoteOpen = false;
    window.removeEventListener("keydown", onKey, true);
    clearInput();
    overlay.style.opacity = "0";
    paper.style.transform = "translateY(12px) scale(.98) rotate(0deg)";
    window.setTimeout(() => overlay.remove(), 190);
    window.setTimeout(() => {
      handlers.forEach((h) => h({ type: "nudge-dialogue" }));
    }, 30);
  };

  close.addEventListener("click", finish);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) finish(); });
  const onKey = (e: KeyboardEvent) => {
    if (e.code === "Escape" || e.code === "KeyE" || e.code === "Enter") { e.preventDefault(); e.stopPropagation(); finish(); }
  };
  window.addEventListener("keydown", onKey, true);
  requestAnimationFrame(() => { overlay.style.opacity = "1"; paper.style.transform = "translateY(0) scale(1) rotate(-.35deg)"; });
}

function spawnWatcher() {
  if (typeof document === "undefined" || horrorBusy) return;
  horrorBusy=true; const layer=horrorLayer(1250); if(!layer){horrorBusy=false;return;}
  const side=Math.random()>.5?"left":"right", x=side==="left"?"7vw":"93vw", y=`${18+Math.random()*58}vh`;
  const head=document.createElement("div"); Object.assign(head.style,{position:"absolute",left:x,top:y,width:"92px",height:"72px",transform:"translate(-50%,-50%) scale(.72)",borderRadius:"48% 48% 42% 42%",background:"radial-gradient(ellipse at 50% 45%, rgba(18,18,18,.96) 0 42%, rgba(0,0,0,.72) 68%, transparent 72%)",filter:"blur(.4px)",opacity:"0",transition:"opacity 90ms linear, transform 240ms ease-out"});
  const eyeStyle={position:"absolute",top:"31px",width:"13px",height:"8px",borderRadius:"50%",background:"#eee",boxShadow:"0 0 7px rgba(255,255,255,.9)"} as const;
  const eyeL=document.createElement("i"), eyeR=document.createElement("i"); Object.assign(eyeL.style,eyeStyle,{left:"27px"}); Object.assign(eyeR.style,eyeStyle,{right:"27px"}); head.append(eyeL,eyeR); layer.appendChild(head);
  requestAnimationFrame(()=>{head.style.opacity="1";head.style.transform="translate(-50%,-50%) scale(1)";});
  if(Math.random()<.35) playHorrorSfx("rustle");
  window.setTimeout(()=>{head.style.opacity="0";head.style.transform="translate(-50%,-50%) scale(.94)";},620);
  window.setTimeout(()=>{horrorBusy=false;},1300);
}

function glitchBurst() {
  const layer=horrorLayer(520); if(!layer)return;
  for(let i=0;i<12;i++){const bar=document.createElement("div");Object.assign(bar.style,{position:"absolute",left:`${Math.random()*100}%`,top:`${Math.random()*100}%`,width:`${4+Math.random()*30}%`,height:`${1+Math.random()*7}px`,background:i%3===0?"rgba(255,20,35,.55)":"rgba(235,235,235,.18)",mixBlendMode:"screen",transform:`translateX(${(Math.random()-.5)*80}px)`});layer.appendChild(bar);}
  const scan=document.createElement("div");Object.assign(scan.style,{position:"absolute",inset:"0",background:"repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,.045) 4px, transparent 5px)",mixBlendMode:"screen"});layer.appendChild(scan);
}

function stareBurst() {
  const layer=horrorLayer(2500); if(!layer)return;
  const eyes=document.createElement("div");Object.assign(eyes.style,{position:"absolute",left:"50%",top:"47%",width:"190px",height:"90px",transform:"translate(-50%,-50%) scale(.25)",opacity:"0",background:"radial-gradient(ellipse at 30% 50%, #f5f5f5 0 9%, transparent 10%), radial-gradient(ellipse at 70% 50%, #f5f5f5 0 9%, transparent 10%)",filter:"drop-shadow(0 0 16px rgba(255,255,255,.35))",transition:"opacity 180ms ease, transform 900ms cubic-bezier(.18,.8,.2,1)"});layer.appendChild(eyes);
  requestAnimationFrame(()=>{eyes.style.opacity="1";eyes.style.transform="translate(-50%,-50%) scale(1)";}); window.setTimeout(()=>{eyes.style.opacity="0";},1450);
}

function screamerBurst() {
  if(typeof document==="undefined"||horrorBusy)return; horrorBusy=true; const layer=horrorLayer(1050); if(!layer){horrorBusy=false;return;}
  const flash=document.createElement("div");Object.assign(flash.style,{position:"absolute",inset:"0",background:"#000",opacity:"0",transition:"opacity 45ms linear"});layer.appendChild(flash);
  const face=document.createElement("div");Object.assign(face.style,{position:"absolute",left:"50%",top:"50%",width:"min(86vw,860px)",height:"min(86vh,860px)",transform:"translate(-50%,-50%) scale(.28) rotate(-3deg)",opacity:"0",backgroundImage:"radial-gradient(ellipse at 50% 48%, rgba(12,12,12,.98) 0 28%, transparent 29%), radial-gradient(ellipse at 36% 37%, rgba(245,245,245,.96) 0 7%, transparent 8%), radial-gradient(ellipse at 64% 37%, rgba(245,245,245,.96) 0 7%, transparent 8%), radial-gradient(ellipse at 36% 37%, #090909 0 2.2%, transparent 2.8%), radial-gradient(ellipse at 64% 37%, #090909 0 2.2%, transparent 2.8%), radial-gradient(ellipse at 50% 66%, rgba(120,0,0,.9) 0 13%, transparent 14%)",filter:"contrast(1.5) saturate(.65) brightness(.62) drop-shadow(0 0 30px rgba(0,0,0,.98))",transition:"opacity 40ms linear, transform 120ms cubic-bezier(.08,.9,.2,1)"});layer.appendChild(face);
  requestAnimationFrame(()=>{flash.style.opacity="1";face.style.opacity="1";face.style.transform=`translate(-50%,-50%) scale(${1.04+Math.random()*.18}) rotate(${(Math.random()-.5)*5}deg)`;});
  try{playSfx("stinger");}catch{/* visual fallback */}
  window.setTimeout(()=>{face.style.opacity="0";flash.style.opacity=".82";},230); window.setTimeout(()=>{horrorBusy=false;},1100);
}

function instantPonyFlash() {
  if(typeof document==="undefined" || horrorBusy || loreNoteOpen)return;
  horrorBusy=true;
  const layer=horrorLayer(760); if(!layer){horrorBusy=false;return;}
  const flash=document.createElement("div");
  Object.assign(flash.style,{position:"absolute",inset:"0",background:"rgba(255,255,255,.92)",opacity:"0",transition:"opacity 35ms linear"});
  const pony=document.createElement("div");
  Object.assign(pony.style,{position:"absolute",left:`${35+Math.random()*30}%`,top:`${25+Math.random()*42}%`,width:"min(55vw,560px)",height:"min(68vh,680px)",transform:`translate(-50%,-50%) scale(${.82+Math.random()*.28}) rotate(${(Math.random()-.5)*7}deg)`,backgroundImage:"url('/sprites/fs-horror.png')",backgroundPosition:"center",backgroundRepeat:"no-repeat",backgroundSize:"contain",filter:"contrast(1.55) brightness(.45) saturate(.25) drop-shadow(0 0 28px rgba(0,0,0,.95))",opacity:"0",transition:"opacity 28ms linear, transform 70ms cubic-bezier(.05,.95,.2,1)"});
  layer.append(flash,pony);
  requestAnimationFrame(()=>{flash.style.opacity=".72";pony.style.opacity="1";pony.style.transform=`translate(-50%,-50%) scale(${1.05+Math.random()*.2}) rotate(${(Math.random()-.5)*8}deg)`;});
  playHorrorSfx("snap");
  window.setTimeout(()=>{flash.style.opacity="0";pony.style.opacity="0";},105);
  window.setTimeout(()=>{horrorBusy=false;},760);
}

function blackoutAmbush() {
  if(typeof document==="undefined" || horrorBusy || loreNoteOpen)return;
  horrorBusy=true;
  const layer=horrorLayer(1450); if(!layer){horrorBusy=false;return;}
  const black=document.createElement("div");
  Object.assign(black.style,{position:"absolute",inset:"0",background:"#000",opacity:"0",transition:"opacity 55ms linear"});
  const whisper=document.createElement("div");
  Object.assign(whisper.style,{position:"absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",fontFamily:"Georgia, serif",fontSize:"clamp(20px,3vw,38px)",letterSpacing:".18em",color:"rgba(255,255,255,.82)",textShadow:"0 0 18px rgba(255,255,255,.25)",opacity:"0",whiteSpace:"nowrap"});
  whisper.textContent=Math.random()<.5?"НЕ ОБОРАЧИВАЙСЯ":"Я ВИЖУ ТЕБЯ";
  layer.append(black,whisper);
  requestAnimationFrame(()=>{black.style.opacity=".94";});
  window.setTimeout(()=>{whisper.style.opacity="1";},260);
  window.setTimeout(()=>{whisper.style.opacity="0";black.style.opacity="0";},520);
  window.setTimeout(()=>{ if(Math.random()<.7){ horrorBusy=false; instantPonyFlash(); } },650);
  playHorrorSfx("breath");
  window.setTimeout(()=>{horrorBusy=false;},1450);
}

function blinkAmbush() {
  if(typeof document==="undefined" || horrorBusy || loreNoteOpen)return;
  horrorBusy=true;
  const layer=horrorLayer(500); if(!layer){horrorBusy=false;return;}
  const lid=document.createElement("div");
  Object.assign(lid.style,{position:"absolute",inset:"0",background:"#000",opacity:"0",transition:"opacity 28ms linear"});
  layer.appendChild(lid);
  requestAnimationFrame(()=>{lid.style.opacity="1";});
  window.setTimeout(()=>{lid.style.opacity="0";},75);
  window.setTimeout(()=>{if(Math.random()<.55)instantPonyFlash();},125);
  window.setTimeout(()=>{horrorBusy=false;},500);
}

function closeBehindFlash() {
  if(typeof document==="undefined" || horrorBusy || loreNoteOpen)return;
  horrorBusy=true;
  const layer=horrorLayer(620); if(!layer){horrorBusy=false;return;}
  const shadow=document.createElement("div");
  Object.assign(shadow.style,{position:"absolute",left:`${10+Math.random()*80}%`,top:`${18+Math.random()*55}%`,width:"130px",height:"260px",transform:"translate(-50%,-50%) scaleY(.1)",background:"radial-gradient(ellipse at 50% 40%, rgba(0,0,0,.96) 0 42%, transparent 72%)",filter:"blur(1px) drop-shadow(0 0 20px rgba(0,0,0,.9))",opacity:"0",transition:"opacity 22ms linear, transform 95ms cubic-bezier(.08,.9,.2,1)"});
  layer.appendChild(shadow);
  requestAnimationFrame(()=>{shadow.style.opacity="1";shadow.style.transform="translate(-50%,-50%) scaleY(1)";});
  playHorrorSfx("steps");
  window.setTimeout(()=>{shadow.style.opacity="0";},155);
  window.setTimeout(()=>{horrorBusy=false;},620);
}

function deathBurst(){const layer=horrorLayer(420);if(!layer)return;Object.assign(layer.style,{background:"radial-gradient(circle at 50% 50%, rgba(255,255,255,.35), rgba(95,0,0,.45) 30%, rgba(0,0,0,.94) 85%)",mixBlendMode:"normal"});}
function shakeScreen(){if(typeof document==="undefined")return;document.body.animate([{transform:"translate(0,0)"},{transform:"translate(-7px,2px)"},{transform:"translate(5px,-3px)"},{transform:"translate(-3px,1px)"},{transform:"translate(0,0)"}],{duration:230,easing:"steps(4,end)"});}

function surpriseEvent(level: number) {
  if(typeof document==="undefined" || horrorBusy || loreNoteOpen)return;
  const roll=Math.random();
  if(level<=2){
    if(roll<.42)closeBehindFlash();
    else if(roll<.78)blinkAmbush();
    else instantPonyFlash();
    return;
  }
  if(level<=4){
    if(roll<.25)closeBehindFlash();
    else if(roll<.48)blackoutAmbush();
    else if(roll<.72)instantPonyFlash();
    else blinkAmbush();
    return;
  }
  if(roll<.2)blackoutAmbush();
  else if(roll<.43)instantPonyFlash();
  else if(roll<.63)screamerBurst();
  else if(roll<.82)closeBehindFlash();
  else blinkAmbush();
}

function organicEvent(level: number) {
  if(typeof document === "undefined" || horrorBusy || loreNoteOpen) return;
  const now=Date.now();
  const cooldown=level<=2?15500:level<=4?11000:8500;
  if(now-lastOrganicHorror<cooldown)return;
  const chance=level<=2?.42:level<=4?.58:.72;
  if(Math.random()>chance)return;
  lastOrganicHorror=now;
  const roll=Math.random();
  if(roll<.18){playHorrorSfx("knock");return;}
  if(roll<.32){playHorrorSfx("rustle");return;}
  if(roll<.45){playHorrorSfx("steps");return;}
  if(roll<.57){playHorrorSfx("breath");return;}
  if(roll<.66){playHorrorSfx("snap");return;}
  if(roll<.83){surpriseEvent(level);return;}
  playHorrorSfx("drone");
  if(level>=5 && Math.random()<.28) window.setTimeout(screamerBurst,500+Math.random()*900);
}

export const bridge={
  emit(e:BridgeEvent){
    if(e.type==="checkpoint"){playSfx("checkpoint");showCheckpointBanner();}
    if(e.type==="hud") organicEvent(e.level);
    if(e.type==="note") showLoreNote(e.id);
    if(e.type==="whisper"){
      const roll=Math.random();
      if(roll<.08) screamerBurst(); else if(roll<.32) surpriseEvent(5); else if(roll<.68) spawnWatcher(); else playHorrorSfx("breath");
    } else if(e.type==="died") { deathBurst(); }
    else if(e.type==="shake-window") { shakeScreen(); playHorrorSfx("snap"); }
    else if(e.type==="overlay"&&e.kind==="glitch") { glitchBurst(); if(Math.random()<.1) window.setTimeout(()=>surpriseEvent(5),90+Math.random()*280); }
    else if(e.type==="overlay"&&e.kind==="stare") { if(Math.random()<.28)screamerBurst(); else {stareBurst();playSfx("stare");} }
    else if(e.type==="overlay"&&e.kind==="black") { const roll=Math.random(); if(roll<.12)window.setTimeout(screamerBurst,Math.min(650,e.ms??650)); else if(roll<.42)window.setTimeout(()=>surpriseEvent(5),Math.min(700,e.ms??700)); }
    handlers.forEach(h=>h(e));
  },
  on(h:Handler){handlers.add(h);return()=>{handlers.delete(h);};},
};
