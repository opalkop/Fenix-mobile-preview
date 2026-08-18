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
    if(module==="complete-picture"||module.includes("complete-picture"))return `complete-picture.html?id=${id}`;
    if(module==="tracing-studio"||module.includes("tracing"))return `tracing.html?id=${id}`;
    return "";
  }

  function shortLabel(page){
    const module=moduleKey(page);
    if(module==="maze-studio"||module.includes("maze"))return "MAZE";
    if(module==="word-search-studio"||module.includes("word-search")||module==="ws")return "WS";
    if(module==="coloring-studio"||module.includes("coloring")||module.includes("colouring"))return "COL";
    if(module==="complete-picture"||module.includes("complete-picture"))return "CTP";
    if(module==="tracing-studio"||module.includes("tracing"))return "TR";
    return module||"PAGE";
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

      const title=card.querySelector("b");
      if(title)title.textContent=`${index+1}. ${shortLabel(page)} · ${page.title||"Untitled"}`;
      const smalls=[...card.querySelectorAll("small")];
      let status=smalls[1];
      if(!status){status=document.createElement("small");card.appendChild(status);}
      status.textContent=target?"Dotknij, aby edytować":"Studio jeszcze niedostępne w FPM · strona zachowana";

      if(!target){
        card.dataset.editable="false";
        card.style.cursor="default";
        card.removeAttribute("role");
        card.removeAttribute("tabindex");
        card.onclick=null;card.onkeydown=null;card.onpointerup=null;
        return;
      }
      card.dataset.editable="true";
      card.style.cursor="pointer";
      card.setAttribute("role","button");
      card.setAttribute("tabindex","0");
      card.onclick=event=>{event.preventDefault();event.stopPropagation();window.location.href=target;};
      card.onkeydown=event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();window.location.href=target;}};
      card.onpointerup=event=>{if(event.pointerType==="touch"){event.preventDefault();window.location.href=target;}};
    });
  }

  const host=document.getElementById("pageList");
  if(host){
    const observer=new MutationObserver(()=>decorateCards());
    observer.observe(host,{childList:true});
  }

  document.querySelectorAll('[data-view="pages"],[data-go="pages"]').forEach(btn=>btn.addEventListener("click",()=>setTimeout(decorateCards,0)));
  window.addEventListener("fenix-state-change",()=>setTimeout(decorateCards,0));
  window.addEventListener("hashchange",()=>{if(location.hash==="#pages")setTimeout(decorateCards,0)});
  setTimeout(decorateCards,0);
})();
