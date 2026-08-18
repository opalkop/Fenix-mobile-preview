"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;
  const host=document.getElementById('pageList');
  if(!host)return;
  const moduleOf=page=>String(FenixPageSchema.moduleOf(page)||'').toLowerCase();
  function decorate(){
    const pages=FenixCore.getCart();
    const cards=[...host.querySelectorAll('.page')];
    cards.forEach((card,index)=>{
      const page=pages[index];
      if(!page||moduleOf(page)!=='dot-to-dot-studio')return;
      card.dataset.dotEditable='true';
      card.dataset.pageId=page.id;
      card.style.cursor='pointer';
      card.setAttribute('role','button');
      card.setAttribute('tabindex','0');
      const title=card.querySelector('b');
      if(title)title.textContent=`${index+1}. DOT · ${page.title||'Connect the Dots!'}`;
      const smalls=[...card.querySelectorAll('small')];
      let status=smalls[1];
      if(!status){status=document.createElement('small');card.appendChild(status)}
      status.textContent='Dotknij, aby edytować';
    });
  }
  function openDotFromCard(card){
    const id=card?.dataset?.pageId;
    if(!id)return false;
    const page=FenixCore.getCart().find(p=>String(p.id)===String(id));
    if(!page||moduleOf(page)!=='dot-to-dot-studio')return false;
    location.href='dot-to-dot.html?id='+encodeURIComponent(id);
    return true;
  }
  host.addEventListener('click',event=>{
    if(event.target.closest('button'))return;
    const card=event.target.closest('.page[data-dot-editable="true"]');
    if(!card)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openDotFromCard(card);
  },true);
  host.addEventListener('pointerup',event=>{
    if(event.pointerType!=='touch'||event.target.closest('button'))return;
    const card=event.target.closest('.page[data-dot-editable="true"]');
    if(!card)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openDotFromCard(card);
  },true);
  host.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    const card=event.target.closest('.page[data-dot-editable="true"]');
    if(!card)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openDotFromCard(card);
  },true);
  new MutationObserver(()=>decorate()).observe(host,{childList:true,subtree:false});
  window.addEventListener('fenix-state-change',()=>setTimeout(decorate,0));
  document.querySelectorAll('[data-view="pages"],[data-go="pages"]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(decorate,0)));
  setTimeout(decorate,0);
})();