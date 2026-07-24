import{mulberry32}from"./maze-engine.js";

export const MAZE_THEMES={
 classic:{label:"Klasyczny",start:"S",end:"M",assets:["◆","●","★","▲"]},
 jungle:{label:"Dżungla",start:"🐒",end:"🍌",assets:["🌿","🍃","🌺","🦋"]},
 dino:{label:"Dino",start:"🦕",end:"🥚",assets:["🌴","🦴","🌋","🪨"]},
 farm:{label:"Farma",start:"🐥",end:"🏠",assets:["🌻","🌾","🥕","🍎"]},
 space:{label:"Kosmos",start:"🚀",end:"🌍",assets:["⭐","🪐","☄️","🌙"]},
 vehicles:{label:"Pojazdy",start:"🚗",end:"🏁",assets:["🚦","🛞","⛽","🔧"]}
};

export function normalizeTheme(value){return MAZE_THEMES[value]?value:"classic"}

export function buildThemeDecorations({seed,theme,count=6}){
 const key=normalizeTheme(theme),definition=MAZE_THEMES[key],random=mulberry32((Number(seed)^0xA53A9E31)>>>0),slots=[
  [.10,.18],[.90,.18],[.08,.48],[.92,.48],[.10,.80],[.90,.80],[.22,.10],[.78,.10],[.22,.91],[.78,.91]
 ];
 const total=Math.max(0,Math.min(slots.length,Number(count)||0));
 return slots.sort(()=>random()-.5).slice(0,total).map((slot,index)=>({x:slot[0],y:slot[1],symbol:definition.assets[Math.floor(random()*definition.assets.length)],rotation:(random()-.5)*.35,scale:.82+random()*.36,index}));
}

export function drawMazeTheme(ctx,{maze,startX,startY,cell,canvasWidth,canvasHeight,theme="classic",decorations=[] ,compact=false}){
 const definition=MAZE_THEMES[normalizeTheme(theme)],fontSize=Math.max(compact?11:24,cell*(compact?.72:1.05));
 decorations.forEach(item=>{ctx.save();ctx.translate(item.x*canvasWidth,item.y*canvasHeight);ctx.rotate(item.rotation||0);ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`${Math.round(fontSize*(item.scale||1))}px Arial`;ctx.globalAlpha=compact?.72:.82;ctx.fillText(item.symbol,0,0);ctx.restore()});
 for(const[point,symbol]of[[maze.start,definition.start],[maze.end,definition.end]]){const x=startX+(point.x+.5)*cell,y=startY+(point.y+.5)*cell;ctx.save();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,Math.max(compact?5:13,cell*.36),0,Math.PI*2);ctx.fill();ctx.strokeStyle="#111827";ctx.lineWidth=Math.max(1,cell*.055);ctx.stroke();ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`${Math.round(Math.max(compact?9:18,cell*.62))}px Arial`;ctx.fillText(symbol,x,y+1);ctx.restore()}
}
