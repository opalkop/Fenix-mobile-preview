import{Storage,STORAGE_KEYS,uid}from"./storage.js";

function now(){return new Date().toISOString()}

export const ProjectManager={
  list(){return Storage.read(STORAGE_KEYS.projects,[])},
  saveAll(projects){return Storage.write(STORAGE_KEYS.projects,projects)},
  activeId(){return localStorage.getItem(STORAGE_KEYS.activeProject)||""},
  active(){const projects=this.list();return projects.find(p=>p.id===this.activeId())||projects[0]||null},
  setActive(id){localStorage.setItem(STORAGE_KEYS.activeProject,id);return this.active()},
  create(name="Nowy projekt",goal=120){
    const project={id:uid("project"),name:name.trim()||"Nowy projekt",goal:Number(goal)||120,description:"",pages:[],createdAt:now(),updatedAt:now()};
    const projects=this.list();projects.unshift(project);this.saveAll(projects);this.setActive(project.id);return project;
  },
  update(id,patch){const projects=this.list().map(p=>p.id===id?{...p,...patch,updatedAt:now()}:p);this.saveAll(projects);return projects.find(p=>p.id===id)||null},
  delete(id){const projects=this.list().filter(p=>p.id!==id);this.saveAll(projects);if(this.activeId()===id){projects[0]?this.setActive(projects[0].id):localStorage.removeItem(STORAGE_KEYS.activeProject)}return projects},
  ensure(){return this.active()||this.create("Mój pierwszy projekt",120)}
};