"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;
  window.openFpmPage=id=>{
    const raw=FenixCore.getCart().find(x=>String(x.id)===String(id));
    if(!raw)return;
    const module=FenixPageSchema.moduleOf(raw);
    if(module==="maze-studio"){
      const start=document.querySelector("#maze");
      if(typeof window.loadPage==="function")window.loadPage(id);
      else location.href=`index.html?id=${encodeURIComponent(id)}#maze`;
      return;
    }
    if(module==="word-search-studio"){
      location.href=`word-search.html?id=${encodeURIComponent(id)}`;
      return;
    }
    if(module==="coloring-studio"){
      location.href=`coloring.html?id=${encodeURIComponent(id)}`;
      return;
    }
  };
})();
