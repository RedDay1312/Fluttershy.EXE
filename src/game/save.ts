import type { Lang } from "./i18n";
import { endingFromStory } from "./story-state";

export const SAVE_VERSION=3;
const KEY="waiting.exe.save";
export type EndingId="escape"|"merge"|"loop"|"kind";
export type SaveData={version:number;lang:Lang;level:number;notes:string[];butterflies:number;marks:number;closeAttempts:number;skippedLines:number;listenedLines:number;deaths:number;music:boolean;sfx:boolean;saveLabel:"ok"|"wait"|"empty"|"fog"|"blood";seenIntro:boolean;checkpoint:{level:number;x:number;y:number}|null;hauntStage:number;angelGone:boolean};
export const defaultSave=():SaveData=>({version:SAVE_VERSION,lang:"ru",level:1,notes:[],butterflies:0,marks:0,closeAttempts:0,skippedLines:0,listenedLines:0,deaths:0,music:true,sfx:true,saveLabel:"ok",seenIntro:false,checkpoint:null,hauntStage:0,angelGone:false});
function migrate(raw:Partial<SaveData>):SaveData{const b=defaultSave();return{...b,...raw,version:SAVE_VERSION,notes:Array.isArray(raw.notes)?raw.notes:[]};}
export function loadSave():SaveData{try{const raw=localStorage.getItem(KEY);return raw?migrate(JSON.parse(raw) as Partial<SaveData>):defaultSave();}catch{return defaultSave();}}
export function writeSave(data:SaveData){try{localStorage.setItem(KEY,JSON.stringify({...data,version:SAVE_VERSION}));}catch{/* private mode */}}
export function clearSave(){try{localStorage.removeItem(KEY);localStorage.removeItem("waiting.exe.story.v1");}catch{/* ignore */}}
export function pickEnding(_s:SaveData):EndingId{return endingFromStory();}
