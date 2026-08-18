"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;

  function moduleKey(page){
    const normalized=FenixPageSchema.normalize(page);
    return String(normalized.module||normalized.recipe?.module||page?.module||page?.recipe?.module||"").trim().toLowerCase();
  }

  function targetFor(page){
    const p=FenixPageSchema.normalize(page),module=moduleKey(p),id=encodeURIComponent(p.id);
    if(module==="maze-studio"||module.includes("maze"))return `index.html?id=${id}#maze`;
    if(module==="word-search-studio"||module.includes("word-search")||module==="ws")return `word-search.html?id=${id}`;
    if(module==="coloring-studio"||module.includes("coloring")||module.includes("colouring"))return `coloring.html?id=${id}`;
    return "";
  }

  function openById(id){
    const raw=FenixCore.getCart().find(x=>String(x.id)===String(id));
    if(!raw){console.warn("FPM: nie znaleziono strony",id);return false;}
    const target=targetFor(raw);
    if(!target){console.warn("FPM: brak edytora dla strony",{id,module:moduleKey(raw)});return false;}
    location.assign(target);
    return true;
  }

  window.openFpmPage=openById;

  // One stable fallback for the project list. The base FPM renderer may rebuild
  // #pageList, so we delegate from the container instead of binding per-card handlers.
  document.addEventListener("click",event=>{
    const host=document.getElementById("pageList");
    if(!host||!host.contains(event.target))return;
    const card=event.target.closest(".page");
    if(!card||!host.contains(card))return;

    const cards=[...host.querySelectorAll(".page")];
    const index=cards.indexOf(card);
    const pages=FenixCore.getCart().map(FenixPageSchema.normalize);
    const page=pages[index];
    if(!page)return;

    const target=targetFor(page);
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(target);
  },true);
})();
