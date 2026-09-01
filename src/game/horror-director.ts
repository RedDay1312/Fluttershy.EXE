import { setStoryFlag, advanceStory } from "./story-state";
import { bridge } from "./bridge";

export type HorrorBeat={id:string;fear:number;event:"glitch"|"distort"|"flicker"|"silhouette"|"shake"|"black"|"stare";ms?:number;flag?:any};

const BEATS:HorrorBeat[]=[
{id:"l1-break",fear:1,event:"glitch",ms:900,flag:"first_break"},
{id:"l2-watcher",fear:2,event:"silhouette",ms:1400,flag:"saw_watcher"},
{id:"l3-system",fear:3,event:"flicker",ms:1800,flag:"system_revealed"},
{id:"l4-core",fear:4,event:"distort",ms:2200,flag:"saw_core"},
{id:"l5-stare",fear:5,event:"stare",ms:2400},
{id:"l6-body",fear:6,event:"distort",ms:2800,flag:"body_broken"},
{id:"l7-end",fear:7,event:"black",ms:3200,flag:"final_break"},
];

export class HorrorDirector{
private fired=new Set<string>();
run(level:number){const beat=BEATS.find(b=>b.id.startsWith(`l${level}-`));if(!beat||this.fired.has(beat.id))return;this.fired.add(beat.id);advanceStory(level,beat.fear);if(beat.flag)setStoryFlag(beat.flag);if(beat.event==="glitch"||beat.event==="distort")bridge.emit({type:"overlay",kind:"glitch",ms:beat.ms});else if(beat.event==="black")bridge.emit({type:"overlay",kind:"black",textKey:"black.2",ms:beat.ms});else if(beat.event==="stare")bridge.emit({type:"overlay",kind:"stare",ms:beat.ms});else bridge.emit({type:"shake-window"});}
reset(){this.fired.clear();}
}
