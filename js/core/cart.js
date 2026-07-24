import{ProjectManager}from"./projects.js";
import{uid}from"./storage.js";
import{EventBus,APP_EVENTS}from"./event-bus.js";

function notify(action,pageId=null){EventBus.emit(APP_EVENTS.CART_CHANGED,{action,pageId,project:ProjectManager.active()})}

export const CartManager={
  pages(){return ProjectManager.ensure().pages||[]},
  add(recipe){const project=ProjectManager.ensure();const page={id:uid("page"),createdAt:new Date().toISOString(),...recipe};ProjectManager.update(project.id,{pages:[...(project.pages||[]),page]});notify("add",page.id);return page},
  remove(pageId){const project=ProjectManager.ensure();ProjectManager.update(project.id,{pages:(project.pages||[]).filter(p=>p.id!==pageId)});notify("remove",pageId)},
  duplicate(pageId){const source=this.pages().find(p=>p.id===pageId);if(!source)return null;const{id,createdAt,...copy}=source;const page=this.add({...copy,title:`${copy.title||"Strona"} — kopia`});notify("duplicate",page.id);return page},
  move(pageId,direction){const project=ProjectManager.ensure(),pages=[...(project.pages||[])],index=pages.findIndex(p=>p.id===pageId),next=index+direction;if(index<0||next<0||next>=pages.length)return false;[pages[index],pages[next]]=[pages[next],pages[index]];ProjectManager.update(project.id,{pages});notify("move",pageId);return true},
  clear(){const project=ProjectManager.ensure();ProjectManager.update(project.id,{pages:[]});notify("clear")}
};