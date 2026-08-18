"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;

  function moduleKey(page){
    const normalized=FenixPageSchema.normalize(page);
    return String(normalized.module||normalized.recipe?.module||page?.module||page?.recipe?.module||"").trim().toLowerCase();
  }

  window.openFpmPage=id=>{
    const raw=FenixCore.getCart().find(x=>String(x.id)===String(id));
    if(!raw)return;
    const module=moduleKey(raw);

    if(module==="maze-studio"||module.includes("maze")){
      location.href=`index.html?id=${encodeURIComponent(id)}#maze`;
      return;
    }
    if(module==="word-search-studio"||module.includes("word-search")||module==="ws"){
      location.href=`word-search.html?id=${encodeURIComponent(id)}`;
      return;
    }
    if(module==="coloring-studio"||module.includes("coloring")||module.includes("colouring")){
      location.href=`coloring.html?id=${encodeURIComponent(id)}`;
      return;
    }

    console.warn("FPM: brak edytora dla strony",{id,module,raw});
  };
})();
