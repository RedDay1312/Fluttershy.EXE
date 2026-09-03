export const CHAPTERS = [
  {name:'I — ТИШИНА',tone:0x8b9270,length:5200,goal:3,platform:'grass',decor:['flower','tree1'],message:'Сад слишком тихий.'},
  {name:'II — ПРИСЛУШИВАЙСЯ',tone:0x59656d,length:5600,goal:4,platform:'stone',decor:['eyes','tree2'],message:'Иногда звук приходит раньше того, кто его издаёт.'},
  {name:'III — НЕ СМОТРИ',tone:0x4e4659,length:6000,goal:5,platform:'void',decor:['hangPink','hangPurple','skull'],message:'Она начинает замечать, что ты смотришь.'},
  {name:'IV — ДОМОЙ',tone:0x632e32,length:6400,goal:6,platform:'blood',decor:['hangOrange','hangYellow','hangWhite'],message:'Дом больше не там, где был.'}
];

export function getChapter(index){ return CHAPTERS[Math.max(0,Math.min(index,CHAPTERS.length-1))]; }

export function buildLayout(index){
  const c=getChapter(index), list=[];
  const segment=c.length/10;
  for(let i=0;i<10;i++){
    const x=Math.floor(segment*i+320);
    list.push({x,y:470-(i%3)*70,w:Phaser.Math.Between(280,560),h:28});
    if(i>0) list.push({x:x+Phaser.Math.Between(110,260),y:300-(i%2)*45,w:190,h:24});
  }
  const memories=Array.from({length:c.goal},(_,i)=>({x:700+i*((c.length-1300)/Math.max(1,c.goal-1)),y:220+(i%2)*105}));
  const traps=Array.from({length:6+index*2},(_,i)=>({x:900+i*((c.length-1200)/Math.max(1,5+index)),y:555,w:54,h:24}));
  return {platforms:list,memories,traps,exitX:c.length-260};
}
