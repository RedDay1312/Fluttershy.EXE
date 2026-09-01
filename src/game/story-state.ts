export const STORY_VERSION=1;
export type StoryFlag="noticed_cottage"|"first_break"|"saw_watcher"|"system_revealed"|"friends_lost"|"survived_freeze"|"crossed_void"|"saw_core"|"cursor_rejected"|"desktop_seen"|"body_broken"|"final_break"|"final_gate";
export type StoryState={version:number;flags:Record<StoryFlag,boolean>;chapter:number;fear:number;mercy:number;truth:number};
const KEY="waiting.exe.story.v1";
const FLAGS:StoryFlag[]=["noticed_cottage","first_break","saw_watcher","system_revealed","friends_lost","survived_freeze","crossed_void","saw_core","cursor_rejected","desktop_seen","body_broken","final_break","final_gate"];
export function defaultStory():StoryState{return{version:STORY_VERSION,flags:Object.fromEntries(FLAGS.map(f=>[f,false])) as Record<StoryFlag,boolean>,chapter:1,fear:0,mercy:0,truth:0};}
export function loadStory():StoryState{try{const raw=localStorage.getItem(KEY);if(!raw)return defaultStory();const base=defaultStory(),s=JSON.parse(raw) as Partial<StoryState>;return{...base,...s,version:STORY_VERSION,flags:{...base.flags,...s.flags}}}catch{return defaultStory();}}
export function saveStory(s:StoryState){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{/* private mode */}}
export function setStoryFlag(flag:StoryFlag,value=true){const s=loadStory();s.flags[flag]=value;saveStory(s);return s;}
export function advanceStory(chapter:number,fear:number){const s=loadStory();s.chapter=Math.max(s.chapter,chapter);s.fear=Math.max(s.fear,fear);saveStory(s);return s;}
export function recordMercy(amount=1){const s=loadStory();s.mercy=Math.max(0,s.mercy+amount);saveStory(s);return s;}
export function recordTruth(amount=1){const s=loadStory();s.truth=Math.max(0,s.truth+amount);saveStory(s);return s;}
export function resetStory(){const s=defaultStory();saveStory(s);return s;}
export function endingFromStory(){const s=loadStory();const f=s.flags;const truth=[f.noticed_cottage,f.system_revealed,f.survived_freeze,f.saw_core,f.desktop_seen].filter(Boolean).length;const mercy=[f.noticed_cottage,f.cursor_rejected,f.survived_freeze,f.crossed_void].filter(Boolean).length;if(f.final_gate&&truth>=4&&mercy>=3)return"kind" as const;if(f.final_gate&&mercy>=2)return"escape" as const;if(f.final_break&&s.fear>=5)return"merge" as const;return"loop" as const;}
