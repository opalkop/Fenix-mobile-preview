"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;
  const host=document.getElementById('pageList');
  if(!host)return;
  const moduleOf=page=>String(FenixPageSchema.moduleOf(page)||page?.module||page?.recipe?.module||'').toLowerCase();
  const isDot=page=>moduleOf(page)==='dot-to-dot-studio'||moduleOf(page).includes('dot-to-dot');
  function openDot(id){
    const page=FenixCore.getCart().find(p=>String(p.id)===String(id));
    if(!page||!isDot(page))return false;
    window.location.assign('dot-to-dot.html?id='+encodeURIComponent(page.id));
    return true;
  }
  function decorate(){
    const pages=FenixCore.getCart();
    const cards=[...host.querySelectorAll('.page')];
    cards.forEach((card,index)=>{
      const page=pages[index];
      if(!page||!isDot(page))return;
      const id=String(page.id);
      card.dataset.dotEditable='true';
      card.dataset.pageId=id;
      card.style.cursor='pointer';
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      const title=card.querySelector('b');
      if(title)title.textContent=`${index+1}. DOT · ${page.title||'Connect the Dots!'}`;
      const smalls=[...card.querySelectorAll('small')];
      let status=smalls[1];
      if(!status){status=document.createElement('small');card.appendChild(status)}
      status.textContent='Dotknij, aby edytować';
      card.onclick=event=>{
        if(event.target.closest('button'))return false;
        event.preventDefault();
        event.stopPropagation();
        openDot(id);
        return false;
      };
      card.onpointerup=event=>{
        if(event.target.closest('button'))return;
        if(event.pointerType==='touch'){
          event.preventDefault();
          event.stopPropagation();
          openDot(id);
        }
      };
      card.onkeydown=event=>{
        if(event.key==='Enter'||event.key===' '){
          event.preventDefault();
          event.stopPropagation();
          openDot(id);
        }
      };
    });
  }
  const rerun=()=>setTimeout(decorate,0);
  new MutationObserver(rerun).observe(host,{childList:true,subtree:true});
  window.addEventListener('fenix-state-change',rerun);
  window.addEventListener('fenix-cart-change',rerun);
  window.addEventListener('hashchange',rerun);
  document.querySelectorAll('[data-view="pages"],[data-go="pages"]').forEach(btn=>btn.addEventListener('click',rerun));
  decorate();
  setTimeout(decorate,100);
  setTimeout(decorate,500);
})();