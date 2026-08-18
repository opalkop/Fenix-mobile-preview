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
    window.location.href=target;
    return true;
  }

  window.openFpmPage=openById;

  function decorateCards(){
    const host=document.getElementById("pageList");
    if(!host)return;
    const pages=FenixCore.getCart().map(FenixPageSchema.normalize);
    const cards=[...host.querySelectorAll(".page")];
    cards.forEach((card,index)=>{
      const page=pages[index];
      if(!page)return;
      const target=targetFor(page);
      card.dataset.pageId=page.id;
      card.dataset.pageModule=moduleKey(page);
      if(!target){
        card.dataset.editable="false";
        card.style.cursor="default";
        return;
      }
      card.dataset.editable="true";
      card.style.cursor="pointer";
      card.setAttribute("role","button");
      card.setAttribute("tabindex","0");
      card.onclick=event=>{
        event.preventDefault();
        event.stopPropagation();
        window.location.href=target;
      };
      card.onkeydown=event=>{
        if(event.key==="Enter"||event.key===" "){
          event.preventDefault();
          window.location.href=target;
        }
      };
      // Mobile fallback: some WebViews have been unreliable with synthetic click
      // on dynamically rebuilt cards. pointerup gives the card a direct navigation path.
      card.onpointerup=event=>{
        if(event.pointerType==="touch"){
          event.preventDefault();
          window.location.href=target;
        }
      };
    });
  }

  const host=document.getElementById("pageList");
  if(host){
    const observer=new MutationObserver(()=>decorateCards());
    observer.observe(host,{childList:true});
  }

  document.querySelectorAll('[data-view="pages"],[data-go="pages"]').forEach(btn=>{
    btn.addEventListener("click",()=>setTimeout(decorateCards,0));
  });
  window.addEventListener("fenix-state-change",()=>setTimeout(decorateCards,0));
  window.addEventListener("hashchange",()=>{if(location.hash==="#pages")setTimeout(decorateCards,0)});
  setTimeout(decorateCards,0);
})();
