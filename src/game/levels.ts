export type Plat={x:number;y:number;w:number;h:number;tex:string;oneWay?:boolean;move?:{dx:number;dy:number;period:number}};
export type Hazard={x:number;y:number;w:number;h:number;kind:"spikes"|"pit"|"puddle"};
export type Pickup={x:number;y:number;kind:"butterfly"|"note"|"flower"|"letter"|"gem"|"mark";id:string};
export type Decor={x:number;y:number;sprite:string;scale?:number;flip?:boolean;sway?:boolean;depth?:number;alpha?:number;follow?:boolean};
export type Npc={x:number;y:number;sprite:string;nameKey:string;lineKey:string;scale?:number};
export type Trigger={x:number;y:number;w:number;h:number;event:"dialogue"|"look"|"red"|"pit"|"bsod"|"notepad"|"windows"|"cursor"|"desktop-pony"|"gravity"|"distort"|"ending"|"freeze"|"black"|"glitch"|"whisper"|"shake"|"angel-gone"|"stare";key?:string;once?:boolean;flag?:string;setFlag?:string};
export type LevelDef={id:number;width:number;height:number;sky:string;far:string;fog?:string;plat:string;spawn:{x:number;y:number};exit:{x:number;y:number;w:number;h:number};platforms:Plat[];hazards:Hazard[];pickups:Pickup[];decor:Decor[];npcs:Npc[];triggers:Trigger[];checkpoints:{x:number;y:number}[];intro:string[];gravity?:number;angel?:boolean};
const H=720,G=628,T=40;
const ground=(x:number,w:number,tex:string):Plat=>({x,y:G,w,h:H-G+8,tex});
const p=(x:number,y:number,w:number,tex:string):Plat=>({x,y,w,h:T,tex,oneWay:true});
const mover=(x:number,y:number,w:number,tex:string,dx:number,dy:number,period:number):Plat=>({x,y,w,h:T,tex,oneWay:true,move:{dx,dy,period}});
const scenery=(w:number,a=1):Decor[]=>{const r:Decor[]=[];for(let x=90;x<w;x+=300){r.push({x,y:G+2,sprite:"tree-3",scale:.48+((x/300)%3)*.04,depth:2,alpha:a});r.push({x:x+90,y:G+2,sprite:"tree-2",scale:.34,flip:x%600>300,depth:3,alpha:a*.82});r.push({x:x+45,y:G+1,sprite:"bush",scale:.42,depth:6,alpha:a});}return r};
const grass=(w:number,a=1):Decor[]=>{const r:Decor[]=[];for(let x=25;x<w;x+=120)r.push({x,y:G+3,sprite:"grass",scale:.68,depth:7,alpha:a});return r};
const eyes=(x:number,y=520,a=.35):Decor=>({x,y,sprite:"eyes",follow:true,sway:true,depth:8,scale:.55,alpha:a});
const base=(id:number,w:number,tex:string,sky:string,far:string,intro:string[],triggers:Trigger[],pickups:Pickup[],decor:Decor[],platforms:Plat[],hazards:Hazard[]=[]):LevelDef=>({id,width:w,height:H,sky,far,plat:tex,spawn:{x:150,y:560},exit:{x:w-150,y:G-168,w:120,h:168},platforms,hazards,pickups,decor:[...decor,...grass(w,id<2?1:.55)],npcs:[],triggers,checkpoints:[{x:150,y:560},{x:1100,y:560},{x:2050,y:560},{x:3000,y:560},{x:3900,y:560}],intro});

const L1P=[ground(0,760,"grass"),p(850,540,190,"grass"),p(1110,465,170,"grass"),ground(1320,720,"grass"),p(1570,535,210,"grass"),p(1870,455,170,"wood"),ground(2100,650,"grass"),p(2330,520,210,"grass"),p(2630,430,160,"grass"),ground(2860,760,"grass"),p(3130,540,200,"wood"),p(3420,460,180,"grass"),ground(3690,720,"grass")];
const L2P=[ground(0,640,"grass"),p(720,520,170,"grass"),p(970,440,170,"grass"),mover(1220,510,150,"wood",0,-90,2600),ground(1450,610,"grass"),p(1690,450,170,"grass"),p(1950,360,160,"wood"),ground(2190,520,"grass"),mover(2460,500,170,"wood",150,0,3200),p(2770,420,180,"grass"),ground(3020,700,"grass"),p(3310,500,170,"stone"),p(3580,390,170,"stone"),ground(3820,760,"grass")];
const L3P=[ground(0,600,"blood"),p(690,500,170,"stone"),p(930,405,150,"blood"),ground(1160,530,"blood"),p(1370,455,180,"wood"),mover(1660,510,160,"wood",0,-120,2400),ground(1900,580,"blood"),p(2150,440,170,"stone"),p(2400,345,160,"blood"),ground(2640,520,"blood"),p(2860,470,190,"wood"),p(3150,350,150,"stone"),ground(3380,620,"blood"),p(3650,470,180,"blood"),ground(3900,760,"blood")];
const L4P=[ground(0,540,"blood"),p(620,480,150,"void"),p(850,350,150,"void"),mover(1080,500,160,"void",0,-170,2800),ground(1320,500,"stone"),p(1510,390,160,"void"),p(1760,300,150,"glitch"),ground(1980,480,"void"),mover(2220,470,150,"void",190,0,2600),p(2500,350,170,"void"),ground(2750,500,"blood"),p(2960,430,160,"glitch"),p(3210,300,150,"void"),ground(3450,520,"void"),p(3670,410,170,"void"),ground(3920,760,"void")];
const L5P=[ground(0,620,"blood"),p(700,510,170,"stone"),p(940,420,150,"stone"),ground(1170,500,"blood"),p(1370,350,160,"void"),mover(1620,480,150,"void",0,-140,2200),ground(1850,450,"void"),p(2050,330,160,"glitch"),p(2300,250,140,"void"),ground(2500,460,"blood"),mover(2740,450,150,"void",210,0,2500),p(3010,340,170,"glitch"),ground(3270,500,"void"),p(3480,300,160,"void"),ground(3720,1100,"void")];
const L6P=[ground(0,520,"void"),p(590,430,150,"glitch"),mover(820,500,140,"void",0,-180,2100),p(1050,300,150,"void"),ground(1280,460,"void"),p(1490,380,150,"glitch"),p(1720,260,140,"void"),ground(1950,420,"void"),mover(2170,430,150,"glitch",220,0,2400),p(2450,300,140,"void"),ground(2670,500,"void"),p(2880,390,150,"glitch"),ground(3130,520,"void"),p(3370,280,140,"void"),ground(3600,1200,"void")];
const L7P=[ground(0,520,"void"),p(600,420,140,"void"),p(830,300,130,"glitch"),ground(1040,430,"void"),p(1260,340,140,"glitch"),ground(1500,390,"void"),mover(1690,410,130,"glitch",0,-160,1900),p(1930,260,130,"void"),ground(2140,400,"void"),p(2350,330,140,"void"),ground(2580,440,"glitch"),p(2820,270,130,"void"),ground(3030,400,"void"),p(3260,350,130,"glitch"),ground(3470,950,"void")];

export const LEVELS:LevelDef[]=[
base(1,4410,"grass","/maps/forest-sky.jpg","/maps/forest-far.jpg",["d.intro.1","d.intro.2","d.intro.3","d.intro.4"],[
{x:610,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l1.mid",setFlag:"first_oddity"},
{x:1320,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l1.cottage",setFlag:"cottage_wrong"},
{x:2020,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l1.sign"},
{x:2850,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l1.angel"},
{x:3560,y:0,w:70,h:H,event:"look",once:true,key:"d.l1.end"},
{x:4140,y:0,w:100,h:H,event:"glitch",once:true,setFlag:"first_break"}
],[{x:470,y:550,kind:"note",id:"1"},{x:1030,y:390,kind:"butterfly",id:"2"},{x:1600,y:490,kind:"flower",id:"3"},{x:2250,y:450,kind:"butterfly",id:"4"},{x:3020,y:520,kind:"note",id:"5"},{x:3630,y:440,kind:"butterfly",id:"6"}], [...scenery(4410,1)], L1P),
base(2,4580,"grass","/maps/fog-sky.jpg","/maps/fog-far.jpg",["d.l2.start","d.l2.angelgone","d.l2.end"],[
{x:650,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l2.start"},
{x:1200,y:0,w:70,h:H,event:"look",once:true,key:"d.l2.look"},
{x:1750,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l2.angelgone",setFlag:"angel_missing"},
{x:2320,y:0,w:70,h:H,event:"whisper",once:true,key:"whisper.1"},
{x:2760,y:0,w:70,h:H,event:"glitch",once:true,setFlag:"saw_watcher"},
{x:3270,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l2.end"},
{x:3910,y:0,w:80,h:H,event:"stare",once:true,key:"d.l2.look"},
{x:4400,y:0,w:100,h:H,event:"glitch",once:true,setFlag:"fog_break"}
],[{x:780,y:470,kind:"note",id:"7"},{x:1100,y:390,kind:"butterfly",id:"8"},{x:1740,y:400,kind:"note",id:"9"},{x:2470,y:440,kind:"butterfly",id:"10"},{x:3060,y:510,kind:"flower",id:"11"},{x:3640,y:380,kind:"butterfly",id:"12"}], [...scenery(4580,.85),eyes(920,470,.22),eyes(2100,500,.28),eyes(3400,450,.35)], L2P,[{x:1410,y:675,w:70,h:45,kind:"pit"},{x:2190,y:675,w:70,h:45,kind:"pit"}]),
base(3,4660,"blood","/maps/blood-sky.jpg","/maps/blood-far.jpg",["d.l3.start","d.l3.whisper","d.l3.end"],[
{x:600,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l3.start"},
{x:1250,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l3.poster"},
{x:1800,y:0,w:70,h:H,event:"whisper",once:true,key:"d.l3.whisper"},
{x:2350,y:0,w:70,h:H,event:"red",once:true,key:"red.1"},
{x:2780,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l3.end",setFlag:"friends_seen"},
{x:3290,y:0,w:70,h:H,event:"bsod",once:true,setFlag:"system_revealed"},
{x:3790,y:0,w:70,h:H,event:"shake",once:true},
{x:4270,y:0,w:100,h:H,event:"glitch",once:true,setFlag:"blood_break"}
],[{x:430,y:540,kind:"note",id:"13"},{x:980,y:365,kind:"note",id:"14"},{x:1450,y:410,kind:"flower",id:"15"},{x:2060,y:300,kind:"note",id:"16"},{x:2570,y:430,kind:"note",id:"17"},{x:3160,y:300,kind:"note",id:"18"},{x:3820,y:420,kind:"note",id:"19"}], [...scenery(4660,.7),eyes(870,470,.45),eyes(1550,430,.55),eyes(2870,450,.62),eyes(4020,430,.72)], L3P,[{x:600,y:675,w:80,h:45,kind:"pit"},{x:1130,y:675,w:70,h:45,kind:"pit"},{x:1900,y:675,w:70,h:45,kind:"pit"},{x:2640,y:675,w:70,h:45,kind:"pit"}]),
base(4,4680,"blood","/maps/void-sky.jpg","/maps/void-far.jpg",["d.l4.after","d.l4.comp","d.l4.discord"],[
{x:520,y:0,w:70,h:H,event:"freeze",once:true,setFlag:"survived_freeze"},
{x:1050,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l4.after"},
{x:1510,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l4.comp"},
{x:2050,y:0,w:70,h:H,event:"gravity",once:true,setFlag:"crossed_void"},
{x:2510,y:0,w:70,h:H,event:"whisper",once:true,key:"whisper.4"},
{x:2980,y:0,w:70,h:H,event:"desktop-pony",once:true},
{x:3470,y:0,w:70,h:H,event:"distort",once:true,setFlag:"saw_core"},
{x:4010,y:0,w:70,h:H,event:"stare",once:true,key:"d.fin.look"},
{x:4400,y:0,w:100,h:H,event:"black",once:true,key:"black.1"}
],[{x:450,y:500,kind:"letter",id:"20"},{x:1160,y:430,kind:"note",id:"21"},{x:1640,y:250,kind:"gem",id:"22"},{x:2260,y:360,kind:"note",id:"23"},{x:3050,y:300,kind:"letter",id:"24"}], [...scenery(4680,.28),eyes(720,430,.7),eyes(1900,400,.8),eyes(2800,400,.85),eyes(3850,390,.9)], L4P,[{x:540,y:675,w:70,h:45,kind:"pit"},{x:1270,y:675,w:70,h:45,kind:"pit"},{x:1900,y:675,w:70,h:45,kind:"pit"},{x:2740,y:675,w:70,h:45,kind:"pit"}]),
base(5,4820,"blood","/maps/void-sky.jpg","/maps/void-far.jpg",["d.l5.1","d.l5.2","d.l5.3"],[
{x:600,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l5.1"},
{x:1120,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l5.2"},
{x:1780,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l5.3"},
{x:2380,y:0,w:70,h:H,event:"whisper",once:true,key:"whisper.2"},
{x:2820,y:0,w:70,h:H,event:"windows",once:true},
{x:3260,y:0,w:70,h:H,event:"cursor",once:true},
{x:3690,y:0,w:70,h:H,event:"stare",once:true,key:"d.l5.stare"},
{x:4310,y:0,w:70,h:H,event:"red",once:true,key:"red.3"},
{x:4590,y:0,w:100,h:H,event:"glitch",once:true,setFlag:"wall_break"}
],[{x:520,y:520,kind:"note",id:"25"},{x:1020,y:390,kind:"note",id:"26"},{x:1510,y:300,kind:"letter",id:"27"},{x:2130,y:230,kind:"gem",id:"28"},{x:2890,y:320,kind:"note",id:"29"},{x:3530,y:270,kind:"note",id:"30"}], [...scenery(4820,.16),eyes(740,400,.72),eyes(1540,370,.8),eyes(2500,350,.88),eyes(3380,340,.94)], L5P,[{x:620,y:675,w:70,h:45,kind:"pit"},{x:1180,y:675,w:70,h:45,kind:"pit"},{x:1860,y:675,w:70,h:45,kind:"pit"},{x:2520,y:675,w:70,h:45,kind:"pit"}]),
base(6,4800,"void","/maps/void-sky.jpg","/maps/glitch-far.jpg",["d.l6.1","d.l6.2","d.l6.gem"],[
{x:520,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l6.1"},
{x:1100,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.l6.2"},
{x:1600,y:0,w:70,h:H,event:"gravity",once:true},
{x:2140,y:0,w:70,h:H,event:"whisper",once:true,key:"whisper.5"},
{x:2700,y:0,w:70,h:H,event:"distort",once:true,setFlag:"body_break"},
{x:3210,y:0,w:70,h:H,event:"desktop-pony",once:true},
{x:3660,y:0,w:70,h:H,event:"black",once:true,key:"black.2"},
{x:4240,y:0,w:100,h:H,event:"glitch",once:true,setFlag:"reality_break"}
],[{x:460,y:410,kind:"note",id:"31"},{x:980,y:280,kind:"gem",id:"32"},{x:1530,y:360,kind:"note",id:"33"},{x:2280,y:250,kind:"letter",id:"34"},{x:2920,y:340,kind:"gem",id:"35"},{x:3490,y:240,kind:"note",id:"36"}], [...scenery(4800,.06),eyes(760,380,.82),eyes(1420,300,.88),eyes(2480,280,.94),eyes(3340,270,.98)], L6P,[{x:520,y:675,w:70,h:45,kind:"pit"},{x:1270,y:675,w:70,h:45,kind:"pit"},{x:1940,y:675,w:70,h:45,kind:"pit"},{x:2660,y:675,w:70,h:45,kind:"pit"}]),
base(7,4520,"void","/maps/finale-sky.jpg","/maps/glitch-far.jpg",["d.fin.1","d.fin.2","d.fin.3","d.fin.4"],[
{x:480,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.fin.1"},
{x:1080,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.fin.2"},
{x:1670,y:0,w:70,h:H,event:"whisper",once:true,key:"whisper.6"},
{x:2210,y:0,w:70,h:H,event:"dialogue",once:true,key:"d.fin.3"},
{x:2790,y:0,w:70,h:H,event:"stare",once:true,key:"d.fin.look"},
{x:3370,y:0,w:70,h:H,event:"red",once:true,key:"red.8"},
{x:3950,y:0,w:70,h:H,event:"black",once:true,key:"d.fin.4"},
{x:4350,y:0,w:100,h:H,event:"ending",once:true}
],[{x:430,y:360,kind:"letter",id:"37"},{x:870,y:250,kind:"gem",id:"38"},{x:1440,y:330,kind:"note",id:"39"},{x:2060,y:220,kind:"gem",id:"40"},{x:2700,y:300,kind:"note",id:"41"},{x:3260,y:240,kind:"letter",id:"42"}], [...scenery(4520,.02),eyes(650,300,.9),eyes(1320,250,.94),eyes(2050,220,.97),eyes(3000,220,1)], L7P,[{x:540,y:675,w:70,h:45,kind:"pit"},{x:1010,y:675,w:70,h:45,kind:"pit"},{x:1470,y:675,w:70,h:45,kind:"pit"},{x:2130,y:675,w:70,h:45,kind:"pit"}])
];

export function getLevel(id:number){return LEVELS.find(l=>l.id===id)??LEVELS[0];}
