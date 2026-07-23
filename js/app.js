import{ProjectManager}from"./core/projects.js";
import{CartManager}from"./core/cart.js";
import{Storage,STORAGE_KEYS}from"./core/storage.js";
import{createMazeStudio}from"./modules/maze.js";

const views=[...document.querySelectorAll(".view")],navButtons=[...document.querySelectorAll("[data-view]")];
function showView(name){views.forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));navButtons.forEach(b=>b.classList.toggle("active",b.dataset.view===name));window.scrollTo({top:0,behavior:"smooth"});renderAll()}
navButtons.forEach(button=>button.onclick=()=>showView(button.dataset.view));

function esc(value){return String(value??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]))}
function fmtDate(value){try{return new Intl.DateTimeFormat("pl-PL",{dateStyle:"medium"}).format(new Date(value))}catch{return"—"}}

function createProject(){const name=prompt("Nazwa projektu:","Nowy projekt");if(name===null)return;const goal=prompt("Planowana liczba stron:","120");ProjectManager.create(name,goal);renderAll();showView("home")}
document.querySelectorAll("[data-create-project]").forEach(b=>b.onclick=createProject);

function renderHome(){const project=ProjectManager.ensure(),pages=project.pages||[],progress=Math.min(100,Math.round((pages.length/(project.goal||120))*100));document.querySelector("#activeProjectName").textContent=project.name;document.querySelector("#activeProjectMeta").textContent=`${pages.length} / ${project.goal||120} stron · ${progress}%`;document.querySelector("#homeContinue").onclick=()=>showView("create");document.querySelector("#homeCart").onclick=()=>showView("cart")}

function renderProjects(){const projects=ProjectManager.list(),box=document.querySelector("#projectsList"),activeId=ProjectManager.activeId();box.innerHTML=projects.length?projects.map(p=>`<div class="project-row"><div><strong>${esc(p.name)}</strong> ${p.id===activeId?'<span class="badge">Aktywny</span>':''}<br><small>${(p.pages||[]).length}/${p.goal||120} stron · ${fmtDate(p.updatedAt)}</small></div><div class="project-actions"><button class="secondary" data-open-project="${p.id}">Otwórz</button><button class="danger" data-delete-project="${p.id}">Usuń</button></div></div>`).join(""):"<p class='empty'>Brak projektów.</p>";box.querySelectorAll("[data-open-project]").forEach(b=>b.onclick=()=>{ProjectManager.setActive(b.dataset.openProject);renderAll();showView("home")});box.querySelectorAll("[data-delete-project]").forEach(b=>b.onclick=()=>{if(confirm("Usunąć projekt i jego strony?")){ProjectManager.delete(b.dataset.deleteProject);ProjectManager.ensure();renderAll()}})}

function renderCart(){const project=ProjectManager.ensure(),pages=project.pages||[],box=document.querySelector("#cartList");document.querySelector("#cartProjectName").textContent=project.name;document.querySelector("#cartCount").textContent=`${pages.length} stron`;box.innerHTML=pages.length?pages.map((p,i)=>`<div class="cart-row"><div><strong>${i+1}. ${esc(p.title||"Strona")}</strong><br><small>${esc(p.module)} · seed ${p.seed??"—"}</small></div><div class="inline-actions"><button class="secondary" data-up="${p.id}">↑</button><button class="secondary" data-down="${p.id}">↓</button><button class="secondary" data-copy="${p.id}">Kopia</button><button class="danger" data-remove="${p.id}">Usuń</button></div></div>`).join(""):"<p class='empty'>Koszyk jest pusty.</p>";box.querySelectorAll("[data-up]").forEach(b=>b.onclick=()=>{CartManager.move(b.dataset.up,-1);renderAll()});box.querySelectorAll("[data-down]").forEach(b=>b.onclick=()=>{CartManager.move(b.dataset.down,1);renderAll()});box.querySelectorAll("[data-copy]").forEach(b=>b.onclick=()=>{CartManager.duplicate(b.dataset.copy);renderAll()});box.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{CartManager.remove(b.dataset.remove);renderAll()})}

function exportProject(){const project=ProjectManager.ensure();if(!(project.pages||[]).length){alert("Koszyk jest pusty.");return}const data={type:"FENIX_MOBILE_PROJECT",formatVersion:2,appVersion:"0.4.0",createdAt:new Date().toISOString(),project};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download=`${project.name.replace(/[^a-z0-9-_]+/gi,"-").toLowerCase()||"fenix-project"}.fenixmobile`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
document.querySelector("#exportProject").onclick=exportProject;
document.querySelector("#clearCart").onclick=()=>{if(confirm("Wyczyścić cały Koszyk Feniksa?")){CartManager.clear();renderAll()}};

function initSettings(){const settings=Storage.read(STORAGE_KEYS.settings,{format:"8.5x11",language:"en"});document.querySelector("#defaultFormat").value=settings.format;document.querySelector("#defaultLanguage").value=settings.language;document.querySelector("#saveSettings").onclick=()=>{Storage.write(STORAGE_KEYS.settings,{format:document.querySelector("#defaultFormat").value,language:document.querySelector("#defaultLanguage").value});document.querySelector("#settingsStatus").textContent="Ustawienia zapisane"}}

function renderAll(){renderHome();renderProjects();renderCart();const project=ProjectManager.ensure();document.querySelector("#headerProject").textContent=project.name}

ProjectManager.ensure();createMazeStudio({onCartChange:renderAll});initSettings();renderAll();showView("home");