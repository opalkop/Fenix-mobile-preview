import{ProjectManager}from"./projects.js";
import{uid}from"./storage.js";
import{EventBus,APP_EVENTS}from"./event-bus.js";
import{migratePage,normalizeRecipe,pageFromRecipe}from"./recipe.js";

function notify(action,pageId=null){EventBus.emit(APP_EVENTS.CART_CHANGED,{action,pageId,project:ProjectManager.active()})}
function savePages(project,pages){ProjectManager.update(project.id,{pages});return pages}

export const CartManager={
  pages(){const project=ProjectManager.ensure(),pages=(project.pages||[]).map(migratePage);if(JSON.stringify(pages)!==JSON.stringify(project.pages||[]))savePages(project,pages);return pages},
  add(recipe){const project=ProjectManager.ensure(),now=new Date().toISOString(),page=pageFromRecipe(normalizeRecipe(recipe),{id:uid("page"),createdAt:now,updatedAt:now});savePages(project,[...(project.pages||[]).map(migratePage),page]);notify("add",page.id);return page},
  update(pageId,recipe){const project=ProjectManager.ensure(),pages=(project.pages||[]).map(migratePage),index=pages.findIndex(page=>page.id===pageId);if(index<0)return null;const old=pages[index],page=pageFromRecipe(normalizeRecipe(recipe),{id:old.id,createdAt:old.createdAt,updatedAt:new Date().toISOString()});pages[index]=page;savePages(project,pages);notify("update",pageId);return page},
  remove(pageId){const project=ProjectManager.ensure();savePages(project,(project.pages||[]).map(migratePage).filter(page=>page.id!==pageId));notify("remove",pageId)},
  duplicate(pageId){const source=this.pages().find(page=>page.id===pageId);if(!source)return null;const recipe=normalizeRecipe(source);recipe.title=`${recipe.title||"Strona"} — kopia`;const page=this.add(recipe);notify("duplicate",page.id);return page},
  move(pageId,direction){const project=ProjectManager.ensure(),pages=[...this.pages()],index=pages.findIndex(page=>page.id===pageId),next=index+direction;if(index<0||next<0||next>=pages.length)return false;[pages[index],pages[next]]=[pages[next],pages[index]];savePages(project,pages);notify("move",pageId);return true},
  clear(){const project=ProjectManager.ensure();savePages(project,[]);notify("clear")}
};
