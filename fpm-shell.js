(()=>{
  const isWordSearch=/word-search\.html(?:$|[?#])/.test(location.href);
  const body=document.body;
  if(!body)return;

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
        <button class="soon" disabled role="listitem"><b>▤</b><span>Book Builder</span><em>WKRÓTCE</em></button>
        <button class="soon" disabled role="listitem"><b>COL</b><span>Coloring</span><em>PÓŹNIEJ</em></button>
        <button class="soon" disabled role="listitem"><b>TR</b><span>Tracing</span><em>PÓŹNIEJ</em></button>
      </div>
    </div>`;
  body.appendChild(bar);

  const handle=bar.querySelector('.fpm-bar-handle');
  const content=bar.querySelector('.fpm-bar-content');
  let open=false,autoTimer=null;

  function setOpen(next){
    open=Boolean(next);
    clearTimeout(autoTimer);
    bar.classList.toggle('open',open);
    handle.setAttribute('aria-expanded',String(open));
    content.setAttribute('aria-hidden',String(!open));
  }
  function autoClose(delay=260){
    clearTimeout(autoTimer);
    autoTimer=setTimeout(()=>setOpen(false),delay);
  }
  function go(target){
    autoClose();
    if(target==='word-search'){
      if(!isWordSearch)setTimeout(()=>location.href='word-search.html',180);
      return;
    }
    if(isWordSearch){
      setTimeout(()=>{location.href=target==='home'?'index.html':`index.html#${target}`},180);
      return;
    }
    const legacy=document.querySelector(`[data-view="${target}"]`)||document.querySelector(`[data-go="${target}"]`);
    if(legacy)legacy.click();
    if(target!=='home')history.replaceState(null,'',`#${target}`);else history.replaceState(null,'',location.pathname);
  }

  handle.addEventListener('click',()=>setOpen(!open));
  bar.querySelectorAll('[data-shell-target]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.shellTarget)));

  if(!isWordSearch&&location.hash){
    const target=location.hash.slice(1);
    if(['home','assets','pages','maze'].includes(target))setTimeout(()=>go(target),0);
  }
})();
