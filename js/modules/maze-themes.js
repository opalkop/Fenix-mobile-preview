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

function insideMaze(item,bounds,padding=.025){
 if(!bounds)return false;
 return item.x>bounds.left-padding&&item.x<bounds.right+padding&&item.y>bounds.top-padding&&item.y<bounds.bottom+padding;
}

function safeSlots(bounds){
 const defaultSlots=[[.08,.18],[.92,.18],[.07,.42],[.93,.42],[.07,.68],[.93,.68],[.10,.90],[.90,.90],[.28,.92],[.72,.92]];
 if(!bounds)return defaultSlots;
 const slots=[];
 const left=Math.max(.055,bounds.left*.48),right=Math.min(.945,1-(1-bounds.right)*.48);
 [.22,.40,.58,.76].forEach(y=>{slots.push([left,y],[right,y])});
 const bottom=Math.min(.94,bounds.bottom+(1-bounds.bottom)*.58);
 [.24,.40,.60,.76].forEach(x=>slots.push([x,bottom]));
 return slots.filter(([x,y])=>!insideMaze({x,y},bounds,.035)&&y>.13);
}

export function buildThemeDecorations({seed,theme,count=0,bounds}){
 const key=normalizeTheme(theme),definition=MAZE_THEMES[key],random=mulberry32((Number(seed)^0xA53A9E31)>>>0),slots=safeSlots(bounds);
 const total=Math.max(0,Math.min(slots.length,Number(count)||0));
 return slots.sort(()=>random()-.5).slice(0,total).map((slot,index)=>({x:slot[0],y:slot[1],symbol:definition.assets[Math.floor(random()*definition.assets.length)],rotation:(random()-.5)*.24,scale:.78+random()*.26,index}));
}

export function drawMazeTheme(ctx,{maze,startX,startY,cell,canvasWidth,canvasHeight,theme="classic",decorations=[],compact=false}){
 const definition=MAZE_THEMES[normalizeTheme(theme)],fontSize=Math.max(compact?11:24,cell*(compact?.72:1.05));
 const bounds={left:startX/canvasWidth,top:startY/canvasHeight,right:(startX+maze.cols*cell)/canvasWidth,bottom:(startY+maze.rows*cell)/canvasHeight};
 decorations.filter(item=>!insideMaze(item,bounds,.025)).forEach(item=>{ctx.save();ctx.translate(item.x*canvasWidth,item.y*canvasHeight);ctx.rotate(item.rotation||0);ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`${Math.round(fontSize*(item.scale||1))}px Arial`;ctx.globalAlpha=compact?.72:.82;ctx.fillText(item.symbol,0,0);ctx.restore()});
 for(const[point,symbol]of[[maze.start,definition.start],[maze.end,definition.end]]){const x=startX+(point.x+.5)*cell,y=startY+(point.y+.5)*cell;ctx.save();ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(x,y,Math.max(compact?5:13,cell*.36),0,Math.PI*2);ctx.fill();ctx.strokeStyle="#111827";ctx.lineWidth=Math.max(1,cell*.055);ctx.stroke();ctx.textAlign="center";ctx.textBaseline="middle";ctx.font=`${Math.round(Math.max(compact?9:18,cell*.62))}px Arial`;ctx.fillText(symbol,x,y+1);ctx.restore()}
}