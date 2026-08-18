"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;

  const moduleOf=page=>String(FenixPageSchema.moduleOf(page)||page?.module||page?.recipe?.module||"").toLowerCase();
  const isTracing=page=>moduleOf(page)==="tracing-studio";

  const previousOpen=window.openFpmPage;
  window.openFpmPage=id=>{
    const page=FenixCore.getCart().find(item=>String(item.id)===String(id));
    if(page&&isTracing(page)){
      location.assign("tracing.html?id="+encodeURIComponent(id));
      return;
    }
    if(typeof previousOpen==="function")return previousOpen(id);
  };

  function patchCards(){
    const host=document.getElementById("pageList");
    if(!host)return;
    const pages=FenixCore.getCart().map(FenixPageSchema.normalize);
    const cards=[...host.querySelectorAll(".page")];
    cards.forEach((card,index)=>{
      const page=pages[index];
      if(!page||!isTracing(page))return;
      const target="tracing.html?id="+encodeURIComponent(page.id);
      const title=card.querySelector("b");
      if(title)title.textContent=`${index+1}. TR · ${page.title||"Trace the Picture!"}`;
      const smalls=[...card.querySelectorAll("small")];
      let status=smalls[1];
      if(!status){status=document.createElement("small");card.appendChild(status)}
      status.textContent="Dotknij, aby edytować";
      card.dataset.editable="true";
      card.style.cursor="pointer";
      card.setAttribute("role","button");
      card.setAttribute("tabindex","0");
      card.onclick=event=>{
        if(event.target.closest("button"))return;
        event.preventDefault();
        location.assign(target);
      };
      card.onkeydown=event=>{
        if(event.key==="Enter"||event.key===" "){
          event.preventDefault();
          location.assign(target);
        }
      };
    });
  }

  const host=document.getElementById("pageList");
  if(host)new MutationObserver(()=>patchCards()).observe(host,{childList:true,subtree:false});
  document.querySelectorAll('[data-view="pages"],[data-go="pages"]').forEach(btn=>btn.addEventListener("click",()=>setTimeout(patchCards,0)));
  window.addEventListener("fenix-state-change",()=>setTimeout(patchCards,0));
  window.addEventListener("hashchange",()=>{if(location.hash==="#pages")setTimeout(patchCards,0)});
  setTimeout(patchCards,0);
})();
