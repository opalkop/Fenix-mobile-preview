"use strict";
(()=>{
  if(!window.FenixCore||!window.FenixPageSchema)return;
  const host=document.getElementById('pageList');
  if(!host)return;
  const moduleOf=page=>String(FenixPageSchema.moduleOf(page)||page?.module||page?.recipe?.module||'').trim().toLowerCase();
  const isDot=page=>{const m=moduleOf(page);return m==='dot-to-dot-studio'||m.includes('dot-to-dot')};
  function decorate(){
    const pages=FenixCore.getCart();
    const cards=[...host.querySelectorAll('.page')];
    cards.forEach((card,index)=>{
      const page=pages[index];
      if(!page||!isDot(page))return;
      const id=String(page.id);
      const href='dot-to-dot.html?id='+encodeURIComponent(id);
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
      let edit=card.querySelector('.dot-direct-edit');
      if(!edit){
        edit=document.createElement('a');
        edit.className='dot-direct-edit';
        edit.textContent='Edytuj DOT →';
        edit.style.cssText='display:inline-flex;margin-top:10px;padding:9px 12px;border-radius:10px;background:#e45520;color:#fff;text-decoration:none;font-weight:900;position:relative;z-index:20';
        const actions=card.querySelector('div[style*="justify-content:flex-end"]');
        if(actions)actions.insertBefore(edit,actions.firstChild);else card.appendChild(edit);
      }
      edit.href=href;
      edit.onclick=event=>{event.stopPropagation()};
      card.onclick=event=>{
        if(event.target.closest('button,a'))return;
        event.preventDefault();
        window.location.href=href;
      };
      card.onkeydown=event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();window.location.href=href}
      };
    });
  }
  const rerun=()=>setTimeout(decorate,0);
  new MutationObserver(rerun).observe(host,{childList:true});
  window.addEventListener('fenix-state-change',rerun);
  window.addEventListener('fenix-cart-change',rerun);
  document.querySelectorAll('[data-view="pages"],[data-go="pages"]').forEach(btn=>btn.addEventListener('click',rerun));
  decorate();setTimeout(decorate,100);setTimeout(decorate,500);
})();