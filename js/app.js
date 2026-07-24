import{ProjectManager}from"./core/projects.js";
import{AppState}from"./core/app-state.js";
import{EventBus,APP_EVENTS}from"./core/event-bus.js";
import{createRouter}from"./core/router.js";
import{createMazeStudio}from"./modules/maze.js?v=0.9.2-alpha8";
import{createColoringStudio}from"./modules/coloring.js";
import{createTracingStudio}from"./modules/tracing.js";
import{createLogicStudio}from"./modules/logic.js";
import{createProjectsController}from"./controllers/projects-controller.js";
import{createCartController}from"./controllers/cart-controller.js";
import{initSettingsAndTransfer}from"./controllers/settings-transfer-controller.js";
import{progressOf}from"./ui/helpers.js";

const router=createRouter();
let projectsController;
let cartController;

function renderHome(){
  const project=ProjectManager.ensure();
  const{count,goal,percent}=progressOf(project);
  document.querySelector("#activeProjectName").textContent=project.name;
  document.querySelector("#activeProjectMeta").textContent=`${count} / ${goal} stron · ${percent}%`;
  document.querySelector("#homeProgress").style.width=`${percent}%`;
  document.querySelector("#homeContinue").onclick=()=>router.show("create");
  document.querySelector("#homeCart").onclick=()=>router.show("cart");
}

function renderShell(){
  renderHome();
  projectsController?.render();
  cartController?.render();
  document.querySelector("#headerProject").textContent=ProjectManager.ensure().name;
}

function afterEditorSave(){
  renderShell();
  requestAnimationFrame(()=>router.show("cart"));
}

const editors={};
editors["maze-studio"]=createMazeStudio({onCartChange:renderShell,onSaved:afterEditorSave});
editors["coloring-studio"]=createColoringStudio({onCartChange:renderShell,onSaved:afterEditorSave});
editors["tracing-studio"]=createTracingStudio({onCartChange:renderShell,onSaved:afterEditorSave});
editors["logic-studio"]=createLogicStudio({onCartChange:renderShell,onSaved:afterEditorSave});
projectsController=createProjectsController({router});
cartController=createCartController({router,editors});
initSettingsAndTransfer({router});

[
  APP_EVENTS.PROJECT_CREATED,
  APP_EVENTS.PROJECT_UPDATED,
  APP_EVENTS.PROJECT_DELETED,
  APP_EVENTS.PROJECT_ACTIVATED,
  APP_EVENTS.CART_CHANGED,
  APP_EVENTS.IMPORT_COMPLETED
].forEach(event=>EventBus.on(event,renderShell));

ProjectManager.ensure();
AppState.markReady();
renderShell();
router.show("home",{scroll:false});
