"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;

  function hrefFor(page){
    const p=FenixPageSchema.normalize(page),m=String(p.module||p.recipe?.module||"").toLowerCase();
    if(m.includes("maze"))return `index.html?id=${encodeURIComponent(p.id)}#maze`;
    if(m.includes("word-search")||m==="ws")return `word-search.html?id=${encodeURIComponent(p.id)}`;
    if(m.includes("coloring")||m.includes("colouring"))return `coloring.html?id=${encodeURIComponent(p.id)}`;
    return "";
  }

  function renderDirectLinks(){
    const host=document.getElementById("pageList");
    if(!host)return;
    const pages=FenixCore.getCart().map(FenixPageSchema.normalize);
    if(!pages.length)return;
    host.innerHTML=pages.map((p,i)=>{
      const s=p.recipe?.settings||{},m=String(p.module||"").toLowerCase();
      const short=m.includes("maze")?"MAZE":m.includes("word-search")?"WS":m.includes("coloring")||m.includes("colouring")?"COL":(p.module||"PAGE");
      const href=hrefFor(p);
      const meta=((s.cols&&s.rows)?`${s.cols}×${s.rows} · `:"")+`seed ${p.recipe?.seed??"—"}`;
      return href
        ? `<a class="page" href="${href}" style="display:block;text-decoration:none;color:inherit"><b>${i+1}. ${short} · ${p.title}</b><small>${meta} · Edytuj →</small></a>`
        : `<article class="page"><b>${i+1}. ${short} · ${p.title}</b><small>${meta}</small></article>`;
    }).join("");
  }

  window.addEventListener("fenix-state-change",()=>setTimeout(renderDirectLinks,0));
  const observer=new MutationObserver(()=>{if(document.getElementById("pageList")?.children.length)renderDirectLinks()});
  const host=document.getElementById("pageList");if(host)observer.observe(host,{childList:true});
  setTimeout(renderDirectLinks,0);
})();
