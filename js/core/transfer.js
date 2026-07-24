import{ProjectManager}from"./projects.js";
import{uid}from"./storage.js";
import{EventBus,APP_EVENTS}from"./event-bus.js";
import{migrateProject}from"./recipe.js";

export const APP_VERSION="0.8.0-alpha1";
export const FORMAT_VERSION=4;

function safeName(name){return(name||"fenix-project").replace(/[^a-z0-9-_]+/gi,"-").replace(/^-+|-+$/g,"").toLowerCase()||"fenix-project"}

export const TransferManager={
  build(project=ProjectManager.ensure()){
    return{type:"FENIX_MOBILE_PROJECT",formatVersion:FORMAT_VERSION,appVersion:APP_VERSION,recipeSchemaVersion:1,createdAt:new Date().toISOString(),project:migrateProject(structuredClone(project))};
  },
  export(project=ProjectManager.ensure()){
    const data=this.build(project),blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download=`${safeName(project.name)}.fenixmobile`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return data;
  },
  validate(data){
    if(!data||data.type!=="FENIX_MOBILE_PROJECT")throw new Error("To nie jest plik FENIX Mobile");
    if(!data.project||!Array.isArray(data.project.pages))throw new Error("Plik projektu jest uszkodzony");
    return true;
  },
  import(data,{asCopy=true}={}){
    this.validate(data);
    const source=migrateProject(structuredClone(data.project)),project={...source,id:asCopy?uid("project"):source.id||uid("project"),name:asCopy?`${source.name||"Projekt"} — import`:(source.name||"Projekt"),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),pages:(source.pages||[]).map(page=>({...page,id:uid("page")}))};
    const projects=ProjectManager.list();projects.unshift(project);ProjectManager.saveAll(projects);ProjectManager.setActive(project.id);EventBus.emit(APP_EVENTS.IMPORT_COMPLETED,{project});return project;
  },
  async importFile(file,options){const text=await file.text();return this.import(JSON.parse(text),options)}
};
