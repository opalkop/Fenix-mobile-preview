import{AppState}from"./app-state.js";

export function createRouter(){
  const views=[...document.querySelectorAll(".view")];
  const buttons=[...document.querySelectorAll("[data-view]")];
  const primaryViews=["home","projects","create","cart","settings"];

  function show(name,{scroll=true}={}){
    const target=document.querySelector(`#view-${name}`);
    if(!target)return false;
    AppState.setView(name);
    views.forEach(view=>view.classList.toggle("active",view===target));
    buttons.forEach(button=>button.classList.toggle("active",button.dataset.view===name));
    if(scroll)window.scrollTo({top:0,behavior:"smooth"});
    return true;
  }

  function canSwipe(target){return !target.closest("input,select,textarea,button,canvas,dialog,.canvas-wrap")}
  let startX=0,startY=0,startTime=0,tracking=false;
  document.addEventListener("touchstart",event=>{if(event.touches.length!==1||!canSwipe(event.target))return;const touch=event.touches[0];startX=touch.clientX;startY=touch.clientY;startTime=Date.now();tracking=true},{passive:true});
  document.addEventListener("touchend",event=>{if(!tracking||event.changedTouches.length!==1)return;tracking=false;const touch=event.changedTouches[0],dx=touch.clientX-startX,dy=touch.clientY-startY,elapsed=Date.now()-startTime;if(elapsed>700||Math.abs(dx)<65||Math.abs(dx)<Math.abs(dy)*1.35)return;const current=AppState.get("view")||"home",index=primaryViews.indexOf(current);if(index<0)return;const next=dx<0?index+1:index-1;if(next>=0&&next<primaryViews.length)show(primaryViews[next])},{passive:true});

  buttons.forEach(button=>button.addEventListener("click",()=>show(button.dataset.view)));
  return{show,current:()=>AppState.get("view")||"home"};
}
