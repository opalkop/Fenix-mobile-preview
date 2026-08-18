"use strict";
(()=>{
  const moduleOf=page=>{try{return window.FenixPageSchema?.moduleOf?FenixPageSchema.moduleOf(page):(page?.module||page?.recipe?.module||"")}catch{return page?.module||page?.recipe?.module||""}};
  const isCtp=page=>String(moduleOf(page)).toLowerCase().includes("complete-picture");

  // Activate CTP pages in the project list without changing FP or rebuilding the list.
  if(window.FenixCore){
    const previous=window.openFpmPage;
    window.openFpmPage=id=>{
      const page=FenixCore.getCart().find(item=>String(item.id)===String(id));
      if(page&&isCtp(page)){location.assign('complete-picture.html?id='+encodeURIComponent(id));return}
      if(typeof previous==='function')return previous(id);
    };

    const enhance=()=>{
      const host=document.getElementById('pageList');if(!host)return;
      const pages=FenixCore.getCart();
      [...host.querySelectorAll('.page')].forEach((card,index)=>{
        const page=pages[index];if(!page||!isCtp(page))return;
        card.setAttribute('role','button');card.setAttribute('tabindex','0');card.style.cursor='pointer';
        card.onclick=()=>location.assign('complete-picture.html?id='+encodeURIComponent(page.id));
        card.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();card.click()}};
        const smalls=[...card.querySelectorAll('small')];
        const status=smalls.find(s=>s.textContent.includes('Studio jeszcze niedostępne'));
        if(status)status.textContent='Dotknij, aby edytować';
        const title=card.querySelector('b');if(title)title.textContent=title.textContent.replace('complete-picture','CTP');
      });
    };
    setTimeout(enhance,0);
    const host=document.getElementById('pageList');if(host)new MutationObserver(()=>setTimeout(enhance,0)).observe(host,{childList:true});
    window.addEventListener('fenix-state-change',()=>setTimeout(enhance,0));
  }

  // Add CTP to the mobile module strip.
  const strip=document.querySelector('.fpm-module-strip');
  if(strip&&!strip.querySelector('[data-ctp-module]')){
    const btn=document.createElement('button');btn.type='button';btn.dataset.ctpModule='1';btn.innerHTML='<b>CTP</b><span>Complete Picture</span>';
    const coloring=[...strip.querySelectorAll('button')].find(b=>b.textContent.includes('Coloring'));
    if(coloring)coloring.insertAdjacentElement('afterend',btn);else strip.prepend(btn);
    btn.addEventListener('click',()=>{location.href='complete-picture.html'});
  }
})();