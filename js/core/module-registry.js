const modules=new Map();

export const ModuleRegistry={
  register(definition){
    if(!definition?.id)throw new Error("Moduł musi mieć identyfikator");
    modules.set(definition.id,{status:"planned",...definition});
    return this.get(definition.id);
  },
  get(id){return modules.get(id)||null},
  list(){return[...modules.values()]},
  supports(page){return Boolean(page?.module&&modules.has(page.module))},
  editorView(page){return this.get(page?.module)?.view||null},
  displayName(id){return this.get(id)?.name||id||"Nieznany moduł"}
};

[
  {id:"maze-studio",name:"Maze Studio",view:"maze",status:"ready"},
  {id:"coloring-studio",name:"Coloring Studio",view:"coloring",status:"beta"},
  {id:"tracing-studio",name:"Tracing Studio",view:"tracing"},
  {id:"matching-studio",name:"Matching Studio",view:"matching"},
  {id:"alphabet-studio",name:"Alphabet Studio",view:"alphabet"},
  {id:"math-studio",name:"Math Studio",view:"math"},
  {id:"dot-to-dot-studio",name:"Dot to Dot Studio",view:"dot-to-dot"},
  {id:"hidden-objects-studio",name:"Hidden Objects Studio",view:"hidden-objects"},
  {id:"logic-studio",name:"Logic Studio",view:"logic"}
].forEach(module=>ModuleRegistry.register(module));
