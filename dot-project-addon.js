"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;
  const host=document.getElementById('pageList');
  if(!host)return;

  const moduleOf=page=>String(FenixPageSchema.moduleOf(page)||page?.module||page?.recipe?.module||'').trim().toLowerCase();
  const isDot=page=>{const mod=moduleOf(page);return mod==='dot-to-dot-studio'||mod.includes('dot-to-dot')};

  function targetForId(id){
    const page=FenixCore.getCart().find(p=>String(p.id)===String(id));
    if(!page||!isDot(page))return '';
    return 'dot-to-dot.html?id='+encodeURIComponent(page.id);
  }

  function decorate(){
    const pages=FenixCore.getCart();
    const cards=[...host.querySelectorAll(':scope > .page')];
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
      const wantedTitle=`${index+1}. DOT · ${page.title||'Connect the Dots!'}`;
      if(title&&title.textContent!==wantedTitle)title.textContent=wantedTitle;

      const smalls=[...card.querySelectorAll('small')];
      let status=smalls[1];
      if(!status){status=document.createElement('small');card.appendChild(status)}
      if(status.textContent!=='Dotknij, aby edytować')status.textContent='Dotknij, aby edytować';
    });
  }

  function cardFromEvent(event){
    if(event.target.closest('button'))return null;
    return event.target.closest('.page[data-dot-editable="true"]');
  }

  function openCard(card){
    const target=targetForId(card?.dataset?.pageId);
    if(!target)return false;
    window.location.href=target;
    return true;
  }

  host.addEventListener('click',event=>{
    const card=cardFromEvent(event);
    if(!card)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openCard(card);
  },true);

  host.addEventListener('pointerup',event=>{
    if(event.pointerType!=='touch')return;
    const card=cardFromEvent(event);
    if(!card)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openCard(card);
  },true);

  host.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    const card=event.target.closest('.page[data-dot-editable="true"]');
    if(!card)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openCard(card);
  },true);

  // FPM rebuilds the direct children of #pageList. Observe only that level.
  // The previous subtree observer retriggered itself when labels were updated.
  new MutationObserver(()=>decorate()).observe(host,{childList:true});
  window.addEventListener('fenix-state-change',()=>setTimeout(decorate,0));
  window.addEventListener('fenix-cart-change',()=>setTimeout(decorate,0));
  document.querySelectorAll('[data-view="pages"],[data-go="pages"]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(decorate,0)));

  decorate();
})();