import{ProjectManager}from"../core/projects.js";
import{renderPageThumbnail}from"../core/thumbnails.js";
import{esc,formatDate,progressOf}from"../ui/helpers.js";

export function createProjectsController({router}){
  const listBox=document.querySelector("#projectsList");
  const search=document.querySelector("#projectSearch");
  let query="";

  function createProject(){
    const name=prompt("Nazwa projektu:","Nowy projekt");
    if(name===null)return;
    const goal=prompt("Planowana liczba stron:","120");
    ProjectManager.create(name,goal);
    router.show("home");
  }

  function render(){
    const activeId=ProjectManager.activeId();
    const projects=ProjectManager.list().filter(project=>project.name.toLowerCase().includes(query));
    listBox.innerHTML=projects.length?projects.map(project=>{
      const{count,goal,percent}=progressOf(project);
      const modules=new Set((project.pages||[]).map(page=>page.module)).size;
      return`<article class="project-card"><div class="project-cover">${count?`<canvas data-project-thumb="${project.id}"></canvas>`:"<span>📘</span>"}</div><div class="project-card-body"><div><strong>${esc(project.name)}</strong> ${project.id===activeId?'<span class="badge">Aktywny</span>':''}<p>${count}/${goal} stron · ${modules} modułów</p></div><div class="progress-track"><span style="width:${percent}%"></span></div><small>Edytowano ${formatDate(project.updatedAt)}</small><div class="project-actions"><button class="primary" data-open-project="${project.id}">Otwórz</button><button class="secondary" data-copy-project="${project.id}">Duplikuj</button><button class="danger" data-delete-project="${project.id}">Usuń</button></div></div></article>`;
    }).join(""):"<p class='empty'>Nie znaleziono projektów.</p>";

    projects.forEach(project=>{
      const canvas=listBox.querySelector(`[data-project-thumb="${project.id}"]`);
      const page=(project.pages||[])[0];
      if(canvas&&page)renderPageThumbnail(canvas,page);
    });
    listBox.querySelectorAll("[data-open-project]").forEach(button=>button.onclick=()=>{ProjectManager.setActive(button.dataset.openProject);router.show("home")});
    listBox.querySelectorAll("[data-copy-project]").forEach(button=>button.onclick=()=>ProjectManager.duplicate(button.dataset.copyProject));
    listBox.querySelectorAll("[data-delete-project]").forEach(button=>button.onclick=()=>{if(confirm("Usunąć projekt i jego strony?")){ProjectManager.delete(button.dataset.deleteProject);ProjectManager.ensure()}});
  }

  document.querySelectorAll("[data-create-project]").forEach(button=>button.onclick=createProject);
  search.oninput=()=>{query=search.value.trim().toLowerCase();render()};
  return{render,createProject};
}
