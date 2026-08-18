(()=>{
  const isWordSearch=/word-search\.html(?:$|[?#])/.test(location.href);
  const isColoring=/coloring\.html(?:$|[?#])/.test(location.href);
  const isStudioPage=isWordSearch||isColoring;
  const body=document.body;
  if(!body)return;

  function moduleOf(page){
    try{return window.FenixPageSchema?.moduleOf?page&&FenixPageSchema.moduleOf(page):(page?.module||page?.recipe?.module||'unknown')}catch{return page?.module||page?.recipe?.module||'unknown'}
  }

  // Central route used by the project-page list. Keep FP untouched: this lives only in FPM.
  if(!isStudioPage&&window.FenixCore){
    const originalOpen=window.openFpmPage;
    window.openFpmPage=id=>{
      const page=FenixCore.getCart().find(item=>String(item.id)===String(id));
      if(!page)return;
      const mod=moduleOf(page);
      if(mod==='maze-studio'){
        if(typeof originalOpen==='function')return originalOpen(id);
        location.href='index.html?id='+encodeURIComponent(id)+'#maze';
        return;
      }
      if(mod==='word-search-studio'){
        location.href='word-search.html?id='+encodeURIComponent(id);
        return;
      }
      if(mod==='coloring-studio'){
        location.href='coloring.html?id='+encodeURIComponent(id);
        return;
      }
      alert('Ta strona jest zapisana poprawnie, ale jej Studio nie zostało jeszcze przeniesione do FPM.');
    };

    const enhanceProjectCards=()=>{
      const list=document.getElementById('pageList');
      if(!list)return;
      [...list.querySelectorAll('.page')].forEach(card=>{
        if(card.querySelector('.fpm-page-edit'))return;
        const hint=document.createElement('span');
        hint.className='fpm-page-edit';
        hint.textContent='Edytuj →';
        hint.style.cssText='display:block;margin-top:8px;font-weight:900;color:#e45520';
        card.appendChild(hint);
        card.style.cursor='pointer';
        card.setAttribute('role','button');
        card.setAttribute('tabindex','0');
        card.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();card.click()}});
      });
    };
    enhanceProjectCards();
    const list=document.getElementById('pageList');
    if(list)new MutationObserver(enhanceProjectCards).observe(list,{childList:true});
    window.addEventListener('fenix-state-change',()=>setTimeout(enhanceProjectCards,0));
  }

  // Coloring Studio edit mode for a page opened from "Strony projektu".
  if(isColoring&&window.FenixCore&&window.FenixPageSchema){
    const editId=new URLSearchParams(location.search).get('id');
    if(editId){
      const raw=FenixCore.getCart().find(item=>String(item.id)===String(editId));
      if(raw&&moduleOf(raw)==='coloring-studio'){
        const page=FenixPageSchema.normalize(raw),s=page.recipe.settings||{},assetRef=page.recipe.content?.assetRef||s.assetRef||null;
        const setValue=(id,value)=>{const el=document.getElementById(id);if(el&&value!=null)el.value=value};
        const setChecked=(id,value)=>{const el=document.getElementById(id);if(el)el.checked=Boolean(value)};
        setValue('title',page.title||s.title||'Color the Picture!');
        setValue('instructions',s.instructions||'Use crayons or pencils to color the picture.');
        setChecked('showTitle',s.showTitle!==false);
        setChecked('showInstructions',s.showInstructions!==false);
        ['titleSize','instructionSize','titleY','assetScale','assetY'].forEach(id=>setValue(id,s[id]));

        const selectSavedAsset=()=>{
          if(!assetRef)return;
          const asset=FenixCore.getAsset(assetRef);if(!asset)return;
          const cards=[...document.querySelectorAll('.asset-card')];
          const card=cards.find(node=>node.querySelector('img')?.getAttribute('src')===asset.dataUrl||node.querySelector('strong')?.textContent===asset.name);
          if(card&&!card.classList.contains('selected'))card.click();
        };
        setTimeout(selectSavedAsset,0);

        const saveButton=document.getElementById('cart');
        if(saveButton){
          saveButton.textContent='Zapisz zmiany w Stronach projektu';
          saveButton.onclick=()=>{
            const number=(id,fallback)=>Number(document.getElementById(id)?.value)||fallback;
            const value=(id,fallback='')=>document.getElementById(id)?.value??fallback;
            const checked=id=>Boolean(document.getElementById(id)?.checked);
            const asset=assetRef?FenixCore.getAsset(assetRef):null;
            if(!asset){alert('Nie znaleziono assetu przypisanego do tej strony.');return}
            const project=FenixCore.getActiveProject();
            const production=window.FenixProduction?.profile?FenixProduction.profile(project.format,project.bleed):(page.production||{});
            const settings={
              title:value('title','Color the Picture!'),
              instructions:value('instructions','Use crayons or pencils to color the picture.'),
              showTitle:checked('showTitle'),showInstructions:checked('showInstructions'),
              titleSize:number('titleSize',112),instructionSize:number('instructionSize',46),
              titleY:number('titleY',230),assetScale:number('assetScale',82),assetY:number('assetY',56),
              pageIndex:s.pageIndex??0
            };
            const updated=FenixPageSchema.normalize({
              ...page,title:settings.title,
              recipe:{...page.recipe,module:'coloring-studio',title:settings.title,settings,content:{assetRef},meta:{...(page.recipe.meta||{}),createdWith:'FPM',production}},
              production,
              source:{app:'fenix-portable-mobile',version:'3.0',format:'native'}
            });
            FenixCore.updatePage(editId,updated);
            const status=document.getElementById('status');if(status)status.textContent='✓ Zapisano zmiany tej strony w projekcie.';
            saveButton.textContent='✓ Zapisano — edytuj dalej';
          };
        }
      }
    }
  }

  const bar=document.createElement('section');
  bar.className='fpm-active-bar';
  bar.innerHTML=`
    <button class="fpm-bar-handle" type="button" aria-expanded="false" aria-label="Rozwiń pasek modułów"><span></span><small>MODUŁY</small></button>
    <div class="fpm-bar-content" aria-hidden="true">
      <div class="fpm-bar-utility" aria-label="Szybka nawigacja FPM">
        <button data-shell-target="home"><span>⌂</span><small>Start</small></button>
        <button data-shell-target="pages"><span>▣</span><small>Projekt</small></button>
        <button data-shell-target="assets"><span>◆</span><small>Assety</small></button>
      </div>
      <div class="fpm-bar-label">WYBIERZ MODUŁ</div>
      <div class="fpm-module-strip" role="list">
        <button data-shell-target="maze" role="listitem"><b>MAZE</b><span>Maze Studio</span></button>
        <button data-shell-target="word-search" role="listitem"><b>WS</b><span>Word Search</span></button>
        <button data-shell-target="coloring" role="listitem"><b>COL</b><span>Coloring</span></button>
        <button class="soon" disabled role="listitem"><b>▤</b><span>Book Builder</span><em>WKRÓTCE</em></button>
        <button class="soon" disabled role="listitem"><b>TR</b><span>Tracing</span><em>PÓŹNIEJ</em></button>
      </div>
    </div>`;
  body.appendChild(bar);

  const handle=bar.querySelector('.fpm-bar-handle');
  const content=bar.querySelector('.fpm-bar-content');
  let open=false,autoTimer=null;
  function setOpen(next){open=Boolean(next);clearTimeout(autoTimer);bar.classList.toggle('open',open);handle.setAttribute('aria-expanded',String(open));content.setAttribute('aria-hidden',String(!open))}
  function autoClose(delay=260){clearTimeout(autoTimer);autoTimer=setTimeout(()=>setOpen(false),delay)}
  function go(target){
    autoClose();
    if(target==='word-search'){if(!isWordSearch)setTimeout(()=>location.href='word-search.html',180);return}
    if(target==='coloring'){if(!isColoring)setTimeout(()=>location.href='coloring.html',180);return}
    if(isStudioPage){setTimeout(()=>{location.href=target==='home'?'index.html':`index.html#${target}`},180);return}
    const legacy=document.querySelector(`[data-view="${target}"]`)||document.querySelector(`[data-go="${target}"]`);
    if(legacy)legacy.click();
    if(target!=='home')history.replaceState(null,'',`#${target}`);else history.replaceState(null,'',location.pathname);
  }
  handle.addEventListener('click',()=>setOpen(!open));
  bar.querySelectorAll('[data-shell-target]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.shellTarget)));

  if(!isStudioPage&&location.hash){
    const target=location.hash.slice(1);
    if(['home','assets','pages','maze'].includes(target))setTimeout(()=>go(target),0);
  }
})();
