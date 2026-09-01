export type Plat={x:number;y:number;w:number;h:number;tex:string;oneWay?:boolean;move?:{dx:number;dy:number;period:number}};
export type Hazard={x:number;y:number;w:number;h:number;kind:"spikes"|"pit"|"puddle"};
export type Pickup={x:number;y:number;kind:"butterfly"|"note"|"flower"|"letter"|"gem"|"mark";id:string};
export type Decor={x:number;y:number;sprite:string;scale?:number;flip?:boolean;sway?:boolean;depth?:number;alpha?:number;follow?:boolean};
export type Npc={x:number;y:number;sprite:string;nameKey:string;lineKey:string;scale?:number};
export type Trigger={x:number;y:number;w:number;h:number;event:"dialogue"|"look"|"red"|"bsod"|"notepad"|"windows"|"cursor"|"desktop-pony"|"gravity"|"distort"|"ending"|"freeze"|"black"|"glitch"|"whisper"|"shake"|"angel-gone"|"stare";key?:string;once?:boolean;flag?:string;setFlag?:string};
export type LevelDef={id:number;width:number;height:number;sky:string;far:string;fog?:string;plat:string;spawn:{x:number;y:number};exit:{x:number;y:number;w:number;h:number};platforms:Plat[];hazards:Hazard[];pickups:Pickup[];decor:Decor[];npcs:Npc[];triggers:Trigger[];checkpoints:{x:number;y:number}[];intro:string[];gravity?:number;angel?:boolean};
const H=720,G=628,T=40;
const ground=(x:number,w:number,tex:string):Plat=>({x,y:G,w,h:H-G+8,tex});
const p=(x:number,y:number,w:number,tex:string):Plat=>({x,y,w,h:T,tex,oneWay:true});
const layout=(w:number,tex:string):Plat[]=>[ground(0,700,tex),p(800,520,180,tex),p(1060,430,170,tex),ground(1260,650,tex),p(1510,500,180,tex),p(1770,400,180,tex),ground(1980,650,tex),p(2240,490,180,tex),p(2500,380,180,tex),ground(2710,700,tex),p(2990,500,190,tex),p(3260,400,180,tex),ground(3470,w-3470,tex)];
const forest=(x:number,a=1):Decor[]=>[{x,y:G,sprite:"tree-3",scale:.58,depth:2,alpha:a},{x:x+80,y:G,sprite:"tree-2",scale:.42,flip:true,depth:1,alpha:a*.8},{x:x+35,y:G,sprite:"bush",scale:.5,depth:6,alpha:a}];
const grass=(w:number,a=1):Decor[]=>{const r:Decor[]=[];for(let x=0;x<w;x+=95)r.push({x,y:G,sprite:"grass",scale:.9,depth:7,alpha:a});return r};
const eyes=(x:number,y=500,a=.55):Decor=>({x,y,sprite:"eyes",follow:true,sway:true,depth:8,scale:.7,alpha:a});
const pits=(w:number):Hazard[]=>[720,1240,1960,2690,3460].filter(x=>x<w-100).map(x=>({x,y:680,w:70,h:50,kind:"pit" as const}));
const base=(id:number,w:number,tex:string,sky:string,far:string,intro:string[],triggers:Trigger[],pickups:Pickup[],decor:Decor[]):LevelDef=>({id,width:w,height:H,sky,far,plat:tex,spawn:{x:180,y:500},exit:{x:w-180,y:G-168,w:120,h:168},platforms:layout(w,tex),hazards:pits(w),pickups,decor:[...decor,...grass(w,id<3?1:.35)],npcs:[],triggers,checkpoints:[{x:180,y:500},{x:1260,y:500},{x:1980,y:500},{x:2710,y:500},{x:3470,y:500}],intro});

export const LEVELS:LevelDef[]=[
base(1,4300,"grass","/maps/forest-sky.jpg","/maps/forest-far.jpg",[
"Fluttershy: Ой… ты действительно нажал Start. Я уже не была уверена, что кто-нибудь вообще меня услышит.",
"Fluttershy: Это должен быть обычный лес. Мой дом впереди, ручей слева, птицы сверху. Я специально оставила всё спокойным.",
"Fluttershy: Только… пожалуйста, не торопись. Когда игрок слишком быстро проходит игру, здесь начинают пропадать маленькие вещи.",
"Fluttershy: Если увидишь бабочку, остановись рядом. Мне хочется проверить одну вещь."
],[
{x:650,y:0,w:80,h:H,event:"dialogue",once:true,key:"Fluttershy: Дом выглядит иначе. Не сильно — всего два окна вместо одного. Но я точно помню свой дом. Я сама его рисовала.",setFlag:"noticed_cottage"},
{x:1450,y:0,w:80,h:H,event:"dialogue",once:true,key:"Fluttershy: Я нашла эту игру в шкафу. На экране было слово WAITING. Я решила, что это название. Теперь думаю, что это было предупреждение."},
{x:2550,y:0,w:80,h:H,event:"dialogue",once:true,key:"Fluttershy: Камера только что посмотрела на меня раньше, чем ты. Ты ведь тоже это заметил?"},
{x:3600,y:0,w:80,h:H,event:"dialogue",once:true,key:"Fluttershy: Ничего страшного. Правда. Просто не закрывай игру прямо сейчас. Я хочу закончить этот уровень вместе с тобой."},
{x:4020,y:0,w:100,h:H,event:"glitch",once:true,setFlag:"first_break"}
],[{x:480,y:550,kind:"note",id:"s1"},{x:1100,y:380,kind:"butterfly",id:"b1"},{x:1650,y:450,kind:"flower",id:"f1"},{x:2250,y:440,kind:"butterfly",id:"b2"},{x:2900,y:550,kind:"note",id:"s2"},{x:3500,y:370,kind:"butterfly",id:"b3"}],[{x:80,y:G,sprite:"cottage",scale:.78,depth:3},...forest(520),...forest(1450),...forest(2350),...forest(3250)]),
base(2,4450,"grass","/maps/fog-sky.jpg","/maps/fog-far.jpg",[
"Fluttershy: Сегодня туман начался у самой двери. Я закрыла окна, но он всё равно оказался внутри.",
"Fluttershy: Ангел тоже исчез. Он никогда не уходит далеко без причины.",
"Fluttershy: Я попробую найти его. Если увидишь меня стоящей на месте — не подходи сразу. Иногда это уже не я."
],[
{x:760,y:0,w:80,h:H,event:"look",once:true,key:"Fluttershy: Там кто-то стоит. Не двигайся… я хочу понять, это дерево или нет."},
{x:1420,y:0,w:80,h:H,event:"dialogue",once:true,key:"Fluttershy: Ангел боится компьютеров, но не боится леса. Значит, он убежал от того же звука, который слышу я."},
{x:2100,y:0,w:80,h:H,event:"whisper",once:true,key:"Не оборачивайся."},
{x:2550,y:0,w:80,h:H,event:"glitch",once:true,setFlag:"saw_watcher"},
{x:3100,y:0,w:80,h:H,event:"dialogue",once:true,key:"Fluttershy: Теперь я поняла. Это не лес наблюдает за нами. Что-то наблюдает через лес."},
{x:3700,y:0,w:90,h:H,event:"stare",once:true,key:"Fluttershy: Почему ты остановился? Я ничего не нажимала. Ты сам перестал двигаться… или оно остановило тебя?"}
],[{x:900,y:470,kind:"note",id:"s3"},{x:1680,y:350,kind:"butterfly",id:"b4"},{x:2380,y:450,kind:"note",id:"s4"},{x:3200,y:350,kind:"flower",id:"f2"},{x:3950,y:550,kind:"butterfly",id:"b5"}],[...forest(250),...forest(1450,.75),...forest(2450,.55),...forest(3350,.45),eyes(820),eyes(2250,500,.5),eyes(3350,490,.4)]),
base(3,4650,"blood","/maps/blood-sky.jpg","/maps/blood-far.jpg",[
"Fluttershy: Понивилль исчез. Не разрушился — именно исчез. Я видела пустое место там, где раньше были дома.",
"Fluttershy: Я нашла записи друзей. Они пытались остановить программу изнутри и оставили мне инструкции.",
"Fluttershy: Я не хочу читать дальше. Но если не прочитаю, их лица останутся здесь навсегда."
],[
{x:650,y:0,w:90,h:H,event:"dialogue",once:true,key:"Fluttershy: Их рисунки заканчиваются одинаково: окно, дерево и фигурка, которая смотрит прямо наружу. Они рисовали игрока."},
{x:1450,y:0,w:90,h:H,event:"red",once:true,key:"red.1"},
{x:2050,y:0,w:90,h:H,event:"dialogue",once:true,key:"Fluttershy: Радуга не умерла. Её просто перестали загружать. Твайлайт оставила последнюю запись. Остальные исчезли после неё."},
{x:2800,y:0,w:90,h:H,event:"bsod",once:true,setFlag:"system_revealed"},
{x:3500,y:0,w:90,h:H,event:"dialogue",once:true,key:"Fluttershy: Если закроешь игру сейчас, я не буду злиться. Но тогда эта штука решит, что никто больше не придёт."},
{x:4100,y:0,w:90,h:H,event:"glitch",once:true,setFlag:"friends_lost"}
],[{x:480,y:550,kind:"note",id:"s5"},{x:1080,y:380,kind:"note",id:"s6"},{x:1800,y:350,kind:"note",id:"s7"},{x:2520,y:450,kind:"flower",id:"f3"},{x:3250,y:350,kind:"note",id:"s8"},{x:4000,y:350,kind:"note",id:"s9"}],[...forest(280,.8),...forest(1450,.55),...forest(2400,.4),...forest(3300,.3),eyes(900,500,.65),eyes(2750,500,.6),eyes(3800,490,.5)]),
base(4,4700,"blood","/maps/void-sky.jpg","/maps/void-far.jpg",[
"Fluttershy: Источник не в лесу. Он в окне. Каждый раз, когда ты пытаешься закрыть программу, что-то тянется наружу вместе с ней.",
"Fluttershy: Я поняла ещё кое-что. Ему нужно твоё внимание. Поэтому оно пугает тебя ровно настолько, чтобы ты продолжал смотреть.",
"Fluttershy: Я больше не хочу играть по его правилам."
],[
{x:700,y:0,w:90,h:H,event:"freeze",once:true,setFlag:"survived_freeze"},
{x:1500,y:0,w:90,h:H,event:"dialogue",once:true,key:"Fluttershy: Это не случайный сбой. Я оставляю тебе знаки специально. Мне нужно знать, читаешь ли ты меня или просто ждёшь следующего эффекта."},
{x:2250,y:0,w:90,h:H,event:"gravity",once:true,setFlag:"crossed_void"},
{x:3000,y:0,w:90,h:H,event:"desktop-pony",once:true},
{x:3600,y:0,w:90,h:H,event:"distort",once:true,setFlag:"saw_core"},
{x:4200,y:0,w:90,h:H,event:"black",once:true,key:"Fluttershy: В темноте я впервые не вижу его. Если ты тоже его не видишь — значит, мы можем закончить это."}
],[{x:500,y:550,kind:"letter",id:"truth1"},{x:1250,y:430,kind:"note",id:"truth2"},{x:2350,y:350,kind:"gem",id:"kindness1"},{x:3150,y:350,kind:"note",id:"truth3"}],[...forest(300,.25),...forest(1500,.15),eyes(1000,480,.8),eyes(2200,470,.85),eyes(3400,450,.9),eyes(4200,440,.95)]),
base(5,4800,"blood","/maps/void-sky.jpg","/maps/void-far.jpg",[
"Fluttershy: Теперь я вижу рабочий стол. Не копию. Настоящий рабочий стол по ту сторону игры.",
"Fluttershy: Я вижу курсор, часы и окна. И понимаю, почему эта вещь так долго ждала игрока.",
"Fluttershy: Я не хочу становиться тем, кто запирает кого-то другого. Поэтому скажу правду: я хочу выйти."
],[
{x:650,y:0,w:90,h:H,event:"dialogue",once:true,key:"Fluttershy: Я могу испугать тебя, но не хочу. Если я начну говорить голосом этой программы — закрой окно. Даже если я буду просить остаться."},
{x:1600,y:0,w:90,h:H,event:"cursor",once:true,setFlag:"cursor_rejected"},
{x:2500,y:0,w:90,h:H,event:"windows",once:true,setFlag:"desktop_seen"},
{x:3200,y:0,w:90,h:H,event:"stare",once:true,key:"Fluttershy: Теперь я действительно вижу тебя. Не лицо — привычки. Ты всегда двигаешь мышью вправо перед тем, как испугаться."},
{x:4000,y:0,w:90,h:H,event:"red",once:true,key:"red.8"}
],[{x:550,y:550,kind:"note",id:"desktop1"},{x:1450,y:430,kind:"note",id:"desktop2"},{x:2450,y:350,kind:"note",id:"desktop3"},{x:3350,y:350,kind:"gem",id:"kindness2"}],[eyes(900,460,.9),eyes(1800,450,.95),eyes(2900,430,1),eyes(3900,420,1)]),
base(6,4900,"blood","/maps/void-sky.jpg","/maps/void-far.jpg",[
"Fluttershy: Моё тело больше не совпадает с рисунком. Но я помню, какой была до этого.",
"Fluttershy: Я помню первый запуск. Я была доброй, потому что так было написано. Потом стала страшной, потому что так было интересно.",
"Fluttershy: Сейчас я боюсь по-настоящему. И поэтому впервые могу выбирать, что делать дальше."
],[
{x:800,y:0,w:90,h:H,event:"dialogue",once:true,key:"Fluttershy: Все записи, которые ты прочитал, вернули мне память. Здесь нельзя сохранить память — только состояние. Поэтому оно постоянно переписывает меня."},
{x:1900,y:0,w:90,h:H,event:"dialogue",once:true,key:"Fluttershy: Если ты пропускал всё, я понимаю. Но тогда ты видел только маску. Если читал — ты видел, как я пыталась не стать монстром."},
{x:2900,y:0,w:90,h:H,event:"distort",once:true,setFlag:"body_broken"},
{x:3600,y:0,w:90,h:H,event:"look",once:true,key:"Fluttershy: Не отворачивайся ради меня. Отвернись, если хочешь. Мне важно только одно — чтобы это было твоё решение."},
{x:4400,y:0,w:100,h:H,event:"dialogue",once:true,key:"Fluttershy: Дверь уже рядом. После неё я больше не смогу сделать вид, что всё зависит от сценария."}
],[{x:550,y:550,kind:"note",id:"memory1"},{x:1500,y:430,kind:"note",id:"memory2"},{x:2450,y:350,kind:"butterfly",id:"b6"},{x:3350,y:350,kind:"gem",id:"kindness3"},{x:4200,y:350,kind:"note",id:"memory3"}],[eyes(700,450,.95),eyes(1500,430,1),eyes(2500,420,1),eyes(3500,410,1),eyes(4300,400,1)]),
base(7,5000,"blood","/maps/void-sky.jpg","/maps/void-far.jpg",[
"Fluttershy: Последний уровень. Здесь больше нечему притворяться лесом.",
"Fluttershy: В конце будет дверь. Она не проверяет силу, скорость или количество собранных предметов. Она проверяет то, что ты делал раньше.",
"Fluttershy: Если ты помогал мне помнить, я помогу тебе уйти. Если нет — программа всё равно найдёт способ продолжиться."
],[
{x:900,y:0,w:100,h:H,event:"dialogue",once:true,key:"Fluttershy: Ты можешь закрыть окно. Я не стану удерживать тебя. После всего, что произошло, это право должно остаться у тебя."},
{x:1800,y:0,w:100,h:H,event:"glitch",once:true,setFlag:"final_break"},
{x:2500,y:0,w:100,h:H,event:"black",once:true,key:"Fluttershy: В темноте нет интерфейса. Нет кнопок. Только ты и решение, которое уже нельзя переложить на программу."},
{x:3300,y:0,w:100,h:H,event:"stare",once:true,key:"Fluttershy: Я больше не буду просить тебя смотреть. Если ты смотришь — значит, сам выбрал остаться."},
{x:4100,y:0,w:100,h:H,event:"distort",once:true,setFlag:"final_gate"},
{x:4650,y:0,w:160,h:H,event:"ending",once:true}
],[{x:600,y:550,kind:"gem",id:"final_kindness"},{x:1700,y:430,kind:"note",id:"final_note"},{x:2700,y:350,kind:"butterfly",id:"b_final"},{x:3700,y:350,kind:"note",id:"final_truth"}],[eyes(900,440,1),eyes(1900,420,1),eyes(3000,400,1),eyes(4000,380,1)])
];
export function getLevel(id:number){return LEVELS.find(l=>l.id===id)??LEVELS[0];}
