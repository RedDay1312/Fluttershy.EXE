export const STORY_VERSION=1;
export type StoryFlag=
  | "noticed_cottage"|"first_break"|"saw_watcher"|"system_revealed"|"friends_lost"
  | "survived_freeze"|"crossed_void"|"saw_core"|"cursor_rejected"|"desktop_seen"
  | "body_broken"|"final_break"|"final_gate";

export type StoryState={version:number;flags:Record<StoryFlag,boolean>;chapter:number;fear:number;mercy:number;truth:number};
const KEY="waiting.exe.story.v1";
const FLAGS:StoryFlag[]=["noticed_cottage","first_break","saw_watcher","system_revealed","friends_lost","survived_freeze","crossed_void","saw_core","cursor_rejected","desktop_seen","body_broken","final_break","final_gate"];
export function defaultStory():StoryState{return{version:STORY_VERSION,flags:Object.fromEntries(FLAGS.map(f=>[f,false])) as Record<StoryFlag,boolean>,chapter:1,fear:0,mercy:0,truth:0};}
export function loadStory():StoryState{try{const raw=localStorage.getItem(KEY);if(!raw)return defaultStory();const s=JSON.parse(raw) as StoryState;return{...defaultStory(),...s,version:STORY_VERSION,flags:{...defaultStory().flags,...s.flags}}}catch{return defaultStory();}}
export function saveStory(s:StoryState){try{localStorage.setItem(KEY,JSON.stringify(s));}catch{/* private mode */}}
export function setStoryFlag(flag:StoryFlag,value=true){const s=loadStory();s.flags[flag]=value;saveStory(s);return s;}
export function advanceStory(chapter:number,fear:number){const s=loadStory();s.chapter=Math.max(s.chapter,chapter);s.fear=Math.max(s.fear,fear);saveStory(s);return s;}
export function recordMercy(amount=1){const s=loadStory();s.mercy=Math.max(0,s.mercy+amount);saveStory(s);return s;}
export function recordTruth(amount=1){const s=loadStory();s.truth=Math.max(0,s.truth+amount);saveStory(s);return s;}
export function resetStory(){const s=defaultStory();saveStory(s);return s;}
export function endingFromStory(){const s=loadStory();if(s.flags.final_gate&&s.truth>=3&&s.mercy>=3)return "kind" as const;if(s.flags.final_gate&&s.mercy>=1)return "escape" as const;if(s.flags.final_break&&s.fear>=5)return "merge" as const;return "loop" as const;}
