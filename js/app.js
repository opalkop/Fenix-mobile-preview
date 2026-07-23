import{ProjectManager}from"./core/projects.js";
import{CartManager}from"./core/cart.js";
import{Storage,STORAGE_KEYS}from"./core/storage.js";
import{renderPageThumbnail}from"./core/thumbnails.js";
import{createMazeStudio}from"./modules/maze.js";

const views=[...document.querySelectorAll(".view")],navButtons=[...document.querySelectorAll("[data-view]")];
let mazeStudio;
function showView(name){views.forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));navButtons.forEach(b=>b.classList.toggle("active",b.dataset.view===name));window.scrollTo({top:0,behavior:"smooth"});renderAll()}
navButtons.forEach(button=>button.onclick=()=>showView(button.dataset.view));

function esc(value){return String(value??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function fmtDate(value){try{return new Intl.DateTimeFormat("pl-PL",{dateStyle:"medium"}).format(new Date(value))}catch{return"—"}}

function createProject(){const name=prompt("Nazwa projektu:","Nowy projekt");if(name===null)return;const goal=prompt("Planowana liczba stron:","120");ProjectManager.create(name,goal);renderAll();showView("home")}
document.querySelectorAll("[data-create-project]").forEach(b=>b.onclick=createProject);

function renderHome(){const project=ProjectManager.ensure(),pages=project.pages||[],progress=Math.min(100,Math.round((pages.length/(project.goal||120))*100));document.querySelector("#activeProjectName").textContent=project.name;document.querySelector("#activeProjectMeta").textContent=`${pages.length} / ${project.goal||120} stron · ${progress}%`;document.querySelector("#homeProgress").style.width=`${progress}%`;document.querySelector("#homeContinue").onclick=()=>showView("create");document.querySelector("#homeCart").onclick=()=>showView("cart")}

function renderProjects(){const projects=ProjectManager.list(),box=document.querySelector("#projectsList"),activeId=ProjectManager.activeId();box.innerHTML=projects.length?projects.map(p=>`<div class="project-row"><div><strong>${esc(p.name)}</strong> ${p.id===activeId?'<span class="badge">Aktywny</span>':''}<br><small>${(p.pages||[]).length}/${p.goal||120} stron · ${fmtDate(p.updatedAt)}</small></div><div class="project-actions"><button class="secondary" data-open-project="${p.id}">Otwórz</button><button class="danger" data-delete-project="${p.id}">Usuń</button></div></div>`).join(""):"<p class='empty'>Brak projektów.</p>";box.querySelectorAll("[data-open-project]").forEach(b=>b.onclick=()=>{ProjectManager.setActive(b.dataset.openProject);renderAll();showView("home")});box.querySelectorAll("[data-delete-project]").forEach(b=>b.onclick=()=>{if(confirm("Usunąć projekt i jego strony?")){ProjectManager.delete(b.dataset.deleteProject);ProjectManager.ensure();renderAll()}})}

function renderCart(){const project=ProjectManager.ensure(),pages=project.pages||[],box=document.querySelector("#cartList");document.querySelector("#cartProjectName").textContent=project.name;document.querySelector("#cartCount").textContent=`${pages.length} stron`;box.innerHTML=pages.length?`<div class="cart-grid">${pages.map((p,i)=>`<article class="page-card"><button class="page-preview" data-edit="${p.id}" aria-label="Edytuj stronę ${i+1}"><span class="page-number">${i+1}</span><canvas data-thumb="${p.id}"></canvas></button><div class="page-info"><strong>${esc(p.title||"Strona")}</strong><small>${p.module==="maze-studio"?"Maze Studio":esc(p.module)}</small></div><div class="page-actions"><button class="secondary" data-up="${p.id}" aria-label="Przesuń wyżej">↑</button><button class="secondary" data-down="${p.id}" aria-label="Przesuń niżej">↓</button><button class="secondary" data-copy="${p.id}">Kopia</button><button class="danger" data-remove="${p.id}">Usuń</button></div></article>`).join("")}</div>`:"<p class='empty'>Koszyk jest pusty.</p>";pages.forEach(page=>renderPageThumbnail(box.querySelector(`[data-thumb="${page.id}"]`),page));box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>{const page=pages.find(p=>p.id===b.dataset.edit);if(page?.module==="maze-studio"&&mazeStudio.loadRecipe(page))showView("maze")});box.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{CartManager.move(b.dataset.up,-1);renderAll()});box.querySelectorAll("[data-down]").forEach(b=>b.onclick=()=>{CartManager.move(b.dataset.down,1);renderAll()});box.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{CartManager.duplicate(b.dataset.copy);renderAll()});box.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{if(confirm("Usunąć tę stronę?")){CartManager.remove(b.dataset.remove);renderAll()}})}

function exportProject(){const project=ProjectManager.ensure();if(!(project.pages||[]).length){alert("Koszyk jest pusty.");return}const data={type:"FENIX_MOBILE_PROJECT",formatVersion:2,appVersion:"0.5.0",createdAt:new Date().toISOString(),project};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download=`${project.name.replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()||"fenix-project"}.fenixmobile`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
document.querySelector("#exportProject").onclick=exportProject;
document.querySelector("#clearCart").onclick=()=>{if(confirm("Wyczyścić cały Koszyk Feniksa?")){CartManager.clear();renderAll()}};

function initSettings(){const settings=Storage.read(STORAGE_KEYS.settings,{format:"8.5x11",language:"en"});document.querySelector("#defaultFormat").value=settings.format;document.querySelector("#defaultLanguage").value=settings.language;document.querySelector("#saveSettings").onclick=()=>{Storage.write(STORAGE_KEYS.settings,{format:document.querySelector("#defaultFormat").value,language:document.querySelector("#defaultLanguage").value});document.querySelector("#settingsStatus").textContent="Ustawienia zapisane"}}

function renderAll(){renderHome();renderProjects();renderCart();const project=ProjectManager.ensure();document.querySelector("#headerProject").textContent=project.name}

ProjectManager.ensure();mazeStudio=createMazeStudio({onCartChange:renderAll});initSettings();renderAll();showView("home");