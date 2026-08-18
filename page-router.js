"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;
  window.openFpmPage=id=>{
    const page=FenixCore.getCart().find(item=>String(item.id)===String(id));
    if(!page)return;
    const module=FenixPageSchema.moduleOf(page);
    if(module==="maze-studio"){
      if(typeof window.loadPage==="function")window.loadPage(id);
      else location.href="index.html?id="+encodeURIComponent(id)+"#maze";
      return;
    }
    if(module==="word-search-studio"){
      location.href="word-search.html?id="+encodeURIComponent(id);
      return;
    }
    if(module==="coloring-studio"){
      location.href="coloring.html?id="+encodeURIComponent(id);
      return;
    }
    console.warn("Brak edytora FPM dla modułu:",module);
  };
})();
