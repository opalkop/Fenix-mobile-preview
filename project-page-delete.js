"use strict";
(()=>{
  if(!window.FenixCore)return;

  function confirmDelete(page,index){
    const title=page?.title||"stronę";
    const ok=window.confirm(`Usunąć stronę ${index+1}: „${title}” z projektu?\n\nAssety pozostaną w bibliotece projektu.`);
    if(!ok)return;
    FenixCore.removePage(page.id);
    const host=document.getElementById("pageList");
    if(host)decorate();
  }

  function decorate(){
    const host=document.getElementById("pageList");
    if(!host)return;
    const pages=FenixCore.getCart();
    const cards=[...host.querySelectorAll(".page")];
    cards.forEach((card,index)=>{
      const page=pages[index];
      if(!page||card.querySelector(".fpm-delete-page"))return;

      let actions=card.querySelector(".fpm-page-actions");
      if(!actions){
        actions=document.createElement("div");
        actions.className="fpm-page-actions";
        actions.style.cssText="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;position:relative;z-index:3";
        card.appendChild(actions);
      }

      const del=document.createElement("button");
      del.type="button";
      del.className="fpm-delete-page";
      del.textContent="Usuń z projektu";
      del.setAttribute("aria-label",`Usuń stronę ${index+1} z projektu`);
      del.style.cssText="border:1px solid #d8a79a;background:#fff6f3;color:#a9361d;border-radius:10px;padding:9px 12px;font-weight:900;font-size:13px;line-height:1.2";
      const stop=event=>{event.preventDefault();event.stopPropagation();};
      del.addEventListener("pointerdown",stop);
      del.addEventListener("pointerup",stop);
      del.addEventListener("click",event=>{stop(event);confirmDelete(page,index);});
      actions.appendChild(del);
    });
  }

  const host=document.getElementById("pageList");
  if(host)new MutationObserver(()=>decorate()).observe(host,{childList:true});
  document.querySelectorAll('[data-view="pages"],[data-go="pages"]').forEach(btn=>btn.addEventListener("click",()=>setTimeout(decorate,0)));
  window.addEventListener("fenix-state-change",()=>setTimeout(decorate,0));
  window.addEventListener("hashchange",()=>{if(location.hash==="#pages")setTimeout(decorate,0)});
  setTimeout(decorate,0);
})();
