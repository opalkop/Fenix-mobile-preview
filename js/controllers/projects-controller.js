import{ProjectManager}from"../core/projects.js";
import{renderPageThumbnail}from"../core/thumbnails.js";
import{esc,formatDate,progressOf}from"../ui/helpers.js";

export function createProjectsController({router}){
  const listBox=document.querySelector("#projectsList");
  const search=document.querySelector("#projectSearch");
  const tools=document.querySelector("#view-projects .project-tools");
  let query="";
  let sortMode="updated";

  function ensureLibraryUi(){
    if(!document.querySelector('link[data-project-library-style]')){
      const link=document.createElement("link");
      link.rel="stylesheet";
      link.href="css/projects.css?v=0.10.2-alpha12";
      link.dataset.projectLibraryStyle="true";
      document.head.append(link);
    }
    const card=document.querySelector("#view-projects .card");
    if(card&&!card.classList.contains("projects-library-card"))card.classList.add("projects-library-card");
    if(tools&&!document.querySelector("#projectSort")){
      tools.insertAdjacentHTML("afterend",`<div class="project-library-controls"><div id="projectStats" class="project-stats"></div><label class="project-sort-label"><span>Sortuj</span><select id="projectSort"><option value="updated">Ostatnio edytowane</option><option value="name">Nazwa A–Z</option><option value="pages">Najwięcej stron</option><option value="progress">Największy postęp</option></select></label></div>`);
      document.querySelector("#projectSort").onchange=event=>{sortMode=event.target.value;render()};
    }
  }

  function createProject(){
    const name=prompt("Nazwa projektu:","Nowy projekt");
    if(name===null)return;
    const goal=prompt("Planowana liczba stron:","120");
    ProjectManager.create(name,goal);
    router.show("home");
  }

  function sortedProjects(projects){
    return [...projects].sort((a,b)=>{
      if(sortMode==="name")return a.name.localeCompare(b.name,"pl",{sensitivity:"base"});
      if(sortMode==="pages")return (b.pages?.length||0)-(a.pages?.length||0);
      if(sortMode==="progress")return progressOf(b).percent-progressOf(a).percent;
      return new Date(b.updatedAt||0)-new Date(a.updatedAt||0);
    });
  }

  function renderStats(allProjects){
    const box=document.querySelector("#projectStats");
    if(!box)return;
    const pageCount=allProjects.reduce((sum,project)=>sum+(project.pages?.length||0),0);
    const active=allProjects.find(project=>project.id===ProjectManager.activeId());
    box.innerHTML=`<div class="project-stat"><strong>${allProjects.length}</strong><span>projektów</span></div><div class="project-stat"><strong>${pageCount}</strong><span>stron łącznie</span></div><div class="project-stat active-stat"><strong>${esc(active?.name||"—")}</strong><span>aktywny projekt</span></div>`;
  }

  function render(){
    ensureLibraryUi();
    const activeId=ProjectManager.activeId();
    const allProjects=ProjectManager.list();
    renderStats(allProjects);
    const projects=sortedProjects(allProjects.filter(project=>project.name.toLowerCase().includes(query)));
    listBox.innerHTML=projects.length?projects.map(project=>{
      const{count,goal,percent}=progressOf(project);
      const modules=new Set((project.pages||[]).map(page=>page.module)).size;
      const isActive=project.id===activeId;
      return`<article class="project-card ${isActive?"is-active":""}">
        <button class="project-cover" data-open-project="${project.id}" aria-label="Otwórz projekt ${esc(project.name)}">${count?`<canvas data-project-thumb="${project.id}"></canvas>`:"<span class=\"empty-cover-icon\">📘</span>"}<span class="project-page-count">${count} str.</span></button>
        <div class="project-card-body">
          <div class="project-card-heading"><div><strong>${esc(project.name)}</strong><p>${modules||0} ${modules===1?"moduł":"moduły"} · cel ${goal} stron</p></div>${isActive?'<span class="badge active-project-badge">Aktywny</span>':''}</div>
          <div class="project-progress-row"><div class="progress-track"><span style="width:${percent}%"></span></div><b>${percent}%</b></div>
          <small class="project-updated">Edytowano ${formatDate(project.updatedAt)}</small>
          <div class="project-actions"><button class="primary" data-open-project="${project.id}">Otwórz</button><button class="secondary" data-project-cart="${project.id}">Koszyk</button><button class="project-more" data-copy-project="${project.id}" title="Duplikuj projekt">⧉</button><button class="project-more danger" data-delete-project="${project.id}" title="Usuń projekt">×</button></div>
        </div>
      </article>`;
    }).join(""):`<div class="empty-library"><span>⌕</span><strong>Nie znaleziono projektów</strong><p>Zmień wyszukiwaną nazwę albo utwórz nowy projekt.</p><button class="primary" data-empty-create>Utwórz projekt</button></div>`;

    projects.forEach(project=>{
      const canvas=listBox.querySelector(`[data-project-thumb="${project.id}"]`);
      const page=(project.pages||[])[0];
      if(canvas&&page)renderPageThumbnail(canvas,page);
    });
    listBox.querySelectorAll("[data-open-project]").forEach(button=>button.onclick=()=>{ProjectManager.setActive(button.dataset.openProject);router.show("home")});
    listBox.querySelectorAll("[data-project-cart]").forEach(button=>button.onclick=()=>{ProjectManager.setActive(button.dataset.projectCart);router.show("cart")});
    listBox.querySelectorAll("[data-copy-project]").forEach(button=>button.onclick=()=>ProjectManager.duplicate(button.dataset.copyProject));
    listBox.querySelectorAll("[data-delete-project]").forEach(button=>button.onclick=()=>{if(confirm("Usunąć projekt i jego strony?")){ProjectManager.delete(button.dataset.deleteProject);ProjectManager.ensure()}});
    const emptyCreate=listBox.querySelector("[data-empty-create]");
    if(emptyCreate)emptyCreate.onclick=createProject;
  }

  document.querySelectorAll("[data-create-project]").forEach(button=>button.onclick=createProject);
  search.oninput=()=>{query=search.value.trim().toLowerCase();render()};
  ensureLibraryUi();
  return{render,createProject};
}
