import { useEffect, useState, type ReactNode } from "react";
import { t } from "@/game/i18n";
import { playSfx } from "@/game/audio";
import { useGameStore } from "@/store/game-store";

export function HauntLayer() { const s=useGameStore(); const h=s.haunt; if(h.stage<=0&&!s.interludeActive)return <BrowserShortcut/>; return <><BrowserShortcut/>{h.eyes?<WallpaperEyes/>:null}{h.bleed?<BleedDrips/>:null}{h.sticky.map((key,i)=><Sticky key={key} text={t(s.lang,key)} i={i}/>)}{h.ponyWalk||s.desktopPony?<WalkingPony/>:null}{h.webcam?<WebcamLed/>:null}{s.interludeActive?<InterludeBanner/>:null}</>; }
function BrowserShortcut(){const s=useGameStore();const label=s.lang==="ru"?"Браузер":"Browser";return <button type="button" aria-label={label} className="desktop-browser-shortcut absolute left-[7.5rem] top-5 z-[25] flex w-20 flex-col items-center gap-1 text-center text-[11px] text-white [text-shadow:0_1px_2px_#000]" onClick={()=>{playSfx("click");s.openWindow("browser")}} onDoubleClick={()=>{playSfx("click");s.openWindow("browser")}}><span className="desktop-browser-icon" aria-hidden="true"><span>◎</span></span><span className="leading-tight">{label}</span></button>}
function WallpaperEyes(){return <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">{[18,42,70,85].map((x,i)=><img key={i} src="/sprites/eyes.png" alt="" className="absolute h-8 w-16 opacity-70" style={{left:`${x}%`,top:`${20+i*14}%`,animation:`look-breathe ${2+i*.4}s ease-in-out infinite alternate`}}/>)}</div>}
function BleedDrips(){return <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] h-40 overflow-hidden">{[12,28,47,63,81].map((x,i)=><span key={i} className="absolute top-0 w-1 rounded-b-full bg-danger/80" style={{left:`${x}%`,height:`${40+(i%3)*22}px`,animation:`drip-fall ${3+i}s ease-in infinite`,animationDelay:`${i*.4}s`}} />)}</div>}
function Sticky({text,i}:{text:string;i:number}){const rot=[-6,4,-2,7,-8,3][i%6],left=[62,74,55,80,48,68][i%6],top=[12,28,44,18,36,52][i%6];return <div className="absolute z-[8] w-36 bg-[#f5e6a3] p-2 font-mono text-[11px] leading-snug text-os-ink shadow-md" style={{left:`${left}%`,top:`${top}%`,transform:`rotate(${rot}deg)`}}>{text}</div>}
function WalkingPony(){return <img src="/sprites/fs-look-4.png" alt="" className="pointer-events-none absolute bottom-12 z-[9] h-28 w-28 object-contain drop-shadow-2xl md:h-40 md:w-40" style={{animation:"pony-cross 18s linear infinite"}}/>}
function WebcamLed(){const lang=useGameStore(s=>s.lang);return <div className="absolute right-3 top-3 z-[12] flex items-center gap-2 rounded-sm bg-black/70 px-2 py-1 text-[10px] text-fg"><span className="h-2 w-2 rounded-full bg-danger" style={{animation:"boot-blink 1s step-end infinite"}}/><span>{t(lang,"cam.on")} · {t(lang,"cam.by")}</span></div>}
function InterludeBanner(){const lang=useGameStore(s=>s.lang);return <div className="pointer-events-none absolute inset-x-0 top-6 z-[15] flex flex-col items-center text-center"><p className="font-display text-3xl text-fg drop-shadow">{t(lang,"inter.title")}</p><p className="mt-1 text-sm text-muted">{t(lang,"inter.body")}</p><p className="mt-2 text-[11px] uppercase tracking-widest text-accent">{t(lang,"inter.open")}</p></div>}
export function Chrome({title,onClose,children,wide}:{title:string;onClose?:()=>void;children:ReactNode;wide?:boolean}){return <div className={"os-window absolute z-20 flex flex-col overflow-hidden "+(wide?"inset-2 md:inset-4":"left-1/2 top-1/2 w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2")}><div className="os-titlebar flex items-center gap-2 px-2 py-1 text-xs"><span className="flex-1 truncate font-medium">{title}</span>{onClose?<button type="button" className="bg-os-face px-2 text-os-ink" onClick={onClose}>×</button>:null}</div>{children}</div>}
export function NotesWindow(){const s=useGameStore();const latest=s.haunt.typingKey?t(s.lang,s.haunt.typingKey):null;return <Chrome title={t(s.lang,"win.notes")} onClose={()=>s.openWindow(null)}><div className="max-h-[50vh] overflow-auto bg-[#fff7d6] p-4 font-mono text-sm text-os-ink">{latest?(s.interludeActive?<TypeLines text={latest}/>:<p className="mb-4 whitespace-pre-wrap">{latest}</p>):null}{!latest&&s.notes.length===0?<p className="text-faint">{t(s.lang,"desk.save.empty")}</p>:s.notes.map(id=><p key={id} className="mb-4 whitespace-pre-wrap">{t(s.lang,`note.${id}`)}</p>)}</div></Chrome>}
function TypeLines({text}:{text:string}){const[n,setN]=useState(0);useEffect(()=>{setN(0);const id=window.setInterval(()=>setN(v=>{if(v>=text.length){window.clearInterval(id);return v}if(v%3===0)playSfx("type");return v+1}),28);return()=>window.clearInterval(id)},[text]);return <p className="whitespace-pre-wrap">{text.slice(0,n)}</p>}
export function DocsWindow(){const s=useGameStore();const labelKey=s.saveLabel==="wait"?"desk.save.wait":s.saveLabel==="empty"?"desk.save.empty":s.saveLabel==="fog"?"desk.save.fog":s.saveLabel==="blood"?"desk.save.blood":"desk.save.ok";return <Chrome title={t(s.lang,"win.docs")} onClose={()=>s.openWindow(null)}><div className="bg-white p-4 text-sm text-os-ink"><p className="font-mono">{t(s.lang,"desk.save")}</p><p className="mt-2 text-danger">{t(s.lang,labelKey)}</p><p className="mt-4 text-faint">{t(s.lang,"ui.level")} {s.level} · {t(s.lang,"ui.notes")} {s.notes.length}/16</p></div></Chrome>}
export function RecycleWindow(){const s=useGameStore();return <Chrome title={t(s.lang,"win.recycle")} onClose={()=>s.openWindow(null)}><div className="max-h-[46vh] bg-white p-3 text-sm text-os-ink">{s.haunt.recycle.length===0?<p className="text-faint">{t(s.lang,"rec.empty")}</p>:s.haunt.recycle.map(name=><div key={name} className="mb-2 flex items-center justify-between gap-2 border-b border-black/10 py-1"><span className="font-mono text-xs">{name}</span><button type="button" className="border border-os-ink/30 px-2 py-0.5 text-[10px]" onClick={()=>{playSfx("whisper");s.tryRestore(name)}}>{t(s.lang,"rec.restore")}</button></div>)}{s.restoreFail?<p className="mt-2 text-danger">{t(s.lang,"rec.fail")}</p>:null}</div></Chrome>}

type MysterySite={host:string;title:string;body:string;detail?:string;minNotes?:number;keywords:string[]};
const MYSTERY_SITES:MysterySite[]=[
 {host:"angel.cottage",title:"Дело №07 — АНГЕЛ",body:"Последняя запись: миска осталась полной. Следы заканчиваются у стены. На стене нет двери.",detail:"В журнале наблюдений есть фраза: «Не отвечай, если голос знает твоё имя».",keywords:["АНГЕЛ","ANGEL"],minNotes:1},
 {host:"silence.cottage",title:"АРХИВ ТИШИНЫ",body:"Понивилль не эвакуировали. Он просто однажды перестал звучать. Записи заканчиваются одновременно во всех домах.",detail:"Последняя строка повреждена: Т _ Ш _ Н А. Две буквы будто вырезаны из текста.",keywords:["ТИШИНА","TISHINA"],minNotes:2},
 {host:"mirror.cottage",title:"ЗЕРКАЛЬНАЯ СЛУЖБА",body:"Если отражение двигается позже тебя — это не отражение. Не проверяй второй раз.",detail:"Время задержки в старой записи: 1,7 секунды. В новой записи задержки уже нет.",keywords:["ЗЕРКАЛО","ЗЕРКАЛЬНАЯ","MIRROR"],minNotes:3},
 {host:"forest.cottage",title:"ЛЕС / СТАРЫЙ МАРШРУТ",body:"Тропа возвращает путника к исходной точке. Но следы на обратном пути появляются раньше самого путника.",detail:"На карте отмечено одно слово: «ПОВТОР».",keywords:["ПОВТОР","REPEAT"],minNotes:4},
 {host:"watcher.cottage",title:"НАБЛЮДАТЕЛЬ",body:"Камера не показывает лицо. Только спину. С каждым просмотром расстояние между камерой и фигурой уменьшается.",detail:"Файл помечен: «ОНА СМОТРИТ».",keywords:["НАБЛЮДАТЕЛЬ","СМОТРИТ","WATCHER"],minNotes:5},
 {host:"fluttershy.cottage",title:"FLUTTERSHY.EXE",body:"Это не вирус и не игра. Это запись, которая учится быть тобой.",detail:"Если копия перестала бояться — не верь ей. Страх означает, что перед тобой ещё ты.",keywords:["ФЛАТТЕРШАЙ","FLUTTERSHY","EXE"],minNotes:6},
 {host:"rules.cottage",title:"ПРАВИЛА",body:"1. Не отвечай голосам. 2. Не называй имена друзей. 3. Не смотри долго в окна и экраны. 4. Не иди по уже пройденному пути.",detail:"Пятое правило стёрто. Восстановить его можно только найдя правильное слово.",keywords:["ПРАВИЛА","RULES"],minNotes:7},
 {host:"last.cottage",title:"ПОСЛЕДНЯЯ СТРАНИЦА",body:"Страница существует только после правильного запроса. Она исчезнет, если закрыть браузер.",detail:"«Если увидишь меня впереди — не подходи».",keywords:["ПОСЛЕДНЯЯ","ПОСЛЕДНЯЯ СТРАНИЦА","LAST"],minNotes:9},
];
const DECOY_RESULTS=[
 {host:"ponyville.local",title:"Понивилль — архив жителей",body:"Старый индекс города. Большинство страниц удалено."},
 {host:"weather.cottage",title:"Архив погоды",body:"Дождь. 03:17. Данные за этот час повторяются каждый день."},
 {host:"help.cottage",title:"Справка",body:"Если вы попали сюда случайно, закройте окно. Если вы искали это намеренно — вы уже видели подсказку."},
];
function normalizeSearch(v:string){return v.trim().toLocaleLowerCase().replace(/ё/g,"е").replace(/[^a-zа-я0-9]+/gi," ").trim();}
export function BrowserWindow(){
 const s=useGameStore();
 const [query,setQuery]=useState("");
 const [submitted,setSubmitted]=useState("");
 const [site,setSite]=useState<MysterySite|typeof DECOY_RESULTS[number]|null>(null);
 const [history,setHistory]=useState<string[]>([]);
 const notes=s.notes.length;
 const submit=(value=query)=>{
   const q=normalizeSearch(value); if(!q)return;
   playSfx("click"); setSubmitted(value); setQuery(value);
   const found=MYSTERY_SITES.find(x=>x.minNotes!<=notes&&x.keywords.some(k=>q.includes(normalizeSearch(k))||normalizeSearch(k).includes(q)));
   if(found){setSite(found);setHistory(h=>[...h.filter(x=>x!==found.host),found.host]);return;}
   const decoy=DECOY_RESULTS.find(x=>q.includes(normalizeSearch(x.host.split(".")[0]))||q.includes(normalizeSearch(x.title)));
   setSite(decoy||null); setHistory(h=>h.slice(-7));
 };
 const go=(host:string)=>{const target=MYSTERY_SITES.find(x=>x.host===host)||DECOY_RESULTS.find(x=>x.host===host);if(target){playSfx("click");setSubmitted(target.host);setQuery(target.host);setSite(target);}};
 return <Chrome title="Браузер — COTTAGE.NET" onClose={()=>s.openWindow(null)} wide>
  <div className="flex min-h-[54vh] flex-col bg-[#f7f7f7] text-os-ink">
   <div className="flex items-center gap-2 border-b border-black/10 bg-[#e7e7e7] px-2 py-2 text-xs">
    <button type="button" className="px-2 text-lg leading-none" onClick={()=>{playSfx("click");setSite(null)}}>←</button>
    <input autoFocus aria-label="Поиск" placeholder="Введите слово или адрес..." value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")submit()}} className="min-w-0 flex-1 rounded border border-black/20 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-black/50" />
    <button type="button" className="border border-black/25 bg-white px-4 py-2 text-xs" onClick={()=>submit()}>Найти</button>
   </div>
   <div className="border-b border-black/10 bg-white px-4 py-2 font-mono text-[9px] text-gray-500">COTTAGE.NET · локальный индекс · найдено записей: {notes}/16</div>
   <div className="flex-1 overflow-auto p-4 md:p-6">
    {!site ? <>
      <div className="mx-auto max-w-2xl py-5 text-center"><div className="text-4xl">◎</div><h2 className="mt-2 font-display text-2xl">Cottage Search</h2><p className="mt-2 font-mono text-xs text-gray-500">Ищи слова, которые встречаются в найденных записях. Некоторые запросы открывают скрытые сайты.</p></div>
      {submitted?<div className="mx-auto mt-4 max-w-2xl border-l-2 border-danger bg-white p-4"><p className="font-mono text-xs">Запрос: <b>{submitted}</b></p><p className="mt-2 text-sm text-gray-600">Совпадений нет. Попробуй другое слово.</p></div>:null}
      <div className="mx-auto mt-5 grid max-w-2xl gap-2">{history.length?history.map(host=><button key={host} type="button" className="border border-black/10 bg-white p-3 text-left hover:border-black/30" onClick={()=>go(host)}><span className="font-mono text-xs text-blue-700">{host}</span><span className="ml-3 text-xs text-gray-500">открыть сохранённую страницу</span></button>):<p className="text-center font-mono text-[10px] text-gray-400">Подсказки не показываются. Ищи сам.</p>}</div>
    </> : <div className="mx-auto max-w-3xl">
      <button type="button" className="mb-4 font-mono text-[10px] text-blue-700" onClick={()=>setSite(null)}>← результаты поиска</button>
      <div className="border-b border-black/10 pb-3"><p className="font-mono text-xs text-blue-700">https://{site.host}/</p><h1 className="mt-2 font-display text-2xl">{site.title}</h1></div>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-7">{site.body}</p>
      {"detail" in site&&site.detail?<div className="mt-5 border-l-2 border-danger bg-white p-4 font-mono text-xs leading-6 text-danger">{site.detail}</div>:null}
      {"minNotes" in site&&site.minNotes&&notes<site.minNotes?<p className="mt-5 font-mono text-[10px] text-gray-500">Часть страницы повреждена. Найдено записей: {notes}. Нужно: {site.minNotes}.</p>:null}
      <div className="mt-8 border-t border-black/10 pt-3 font-mono text-[9px] text-gray-400">COTTAGE NETWORK · страница сохранена локально · внешний интернет недоступен</div>
    </div>}
   </div>
  </div>
 </Chrome>;
}
export function TaskWindow(){const s=useGameStore();const[deny,setDeny]=useState(false);const rows=["task.1","task.2","task.3","task.4"];return <Chrome title={t(s.lang,"win.task")} onClose={()=>s.openWindow(null)}><div className="bg-white p-3 text-xs text-os-ink">{rows.map(k=><div key={k} className="mb-1 flex items-center justify-between border-b border-black/10 py-1"><span className="font-mono">{t(s.lang,k)}</span><button type="button" className="border border-os-ink/30 px-2 py-0.5" onClick={()=>{playSfx("stinger");setDeny(true)}}>{t(s.lang,"task.end")}</button></div>)}{deny?<p className="mt-2 text-danger">{t(s.lang,"task.deny")}</p>:null}</div></Chrome>}
export function CompWindow(){const s=useGameStore();return <Chrome title={t(s.lang,"win.comp")} onClose={()=>s.openWindow(null)}><div className="bg-white p-4 font-mono text-xs text-os-ink"><p>{t(s.lang,"comp.drive")}</p><p className="mt-2 text-danger">{t(s.lang,"comp.f")}</p><p className="mt-4 text-faint">{t(s.lang,"comp.users")}</p></div></Chrome>}
export function FileWindow(){const s=useGameStore();if(!s.openFile)return null;return <Chrome title={s.openFile.title} onClose={()=>s.openWindow(null)}><div className="max-h-[46vh] overflow-auto bg-[#fff7d6] p-4 font-mono text-sm whitespace-pre-wrap text-os-ink">{s.openFile.body}</div></Chrome>}
