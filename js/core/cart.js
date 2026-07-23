import{ProjectManager}from"./projects.js";
import{uid}from"./storage.js";

export const CartManager={
  pages(){return ProjectManager.ensure().pages||[]},
  add(recipe){const project=ProjectManager.ensure();const page={id:uid("page"),createdAt:new Date().toISOString(),...recipe};ProjectManager.update(project.id,{pages:[...(project.pages||[]),page]});return page},
  remove(pageId){const project=ProjectManager.ensure();ProjectManager.update(project.id,{pages:(project.pages||[]).filter(p=>p.id!==pageId)})},
  duplicate(pageId){const source=this.pages().find(p=>p.id===pageId);if(!source)return null;const{id,createdAt,...copy}=source;return this.add({...copy,title:`${copy.title||"Strona"} — kopia`})},
  move(pageId,direction){const project=ProjectManager.ensure(),pages=[...(project.pages||[])],index=pages.findIndex(p=>p.id===pageId),next=index+direction;if(index<0||next<0||next>=pages.length)return;[pages[index],pages[next]]=[pages[next],pages[index]];ProjectManager.update(project.id,{pages})},
  clear(){const project=ProjectManager.ensure();ProjectManager.update(project.id,{pages:[]})}
};