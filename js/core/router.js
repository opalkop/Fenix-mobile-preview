import{AppState}from"./app-state.js";
import{EventBus,APP_EVENTS}from"./event-bus.js";

export function createRouter(){
  const views=[...document.querySelectorAll(".view")];
  const buttons=[...document.querySelectorAll("[data-view]")];

  function show(name,{scroll=true}={}){
    const target=document.querySelector(`#view-${name}`);
    if(!target)return false;
    AppState.setView(name);
    views.forEach(view=>view.classList.toggle("active",view===target));
    buttons.forEach(button=>button.classList.toggle("active",button.dataset.view===name));
    if(scroll)window.scrollTo({top:0,behavior:"smooth"});
    EventBus.emit(APP_EVENTS.VIEW_CHANGED,{view:name});
    return true;
  }

  buttons.forEach(button=>button.addEventListener("click",()=>show(button.dataset.view)));
  return{show,current:()=>AppState.get?.().view||"home"};
}
