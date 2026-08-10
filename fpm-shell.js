(()=>{
  const isWordSearch=/word-search\.html(?:$|[?#])/.test(location.href);
  const header=document.querySelector('.top');
  if(!header)return;

  const bar=document.createElement('section');
  bar.className='fpm-active-bar';
  bar.innerHTML=`
    <button class="fpm-bar-handle" type="button" aria-expanded="false" aria-label="Rozwiń aktywną belkę"><span></span></button>
    <div class="fpm-bar-content" aria-hidden="true">
      <nav class="fpm-bar-main" aria-label="Nawigacja FPM">
        <button data-shell-target="home"><span>⌂</span><small>Start</small></button>
        <button data-shell-target="pages"><span>▣</span><small>Projekt</small></button>
        <button data-studios-toggle><span>▦</span><small>Studia</small></button>
        <button data-shell-target="assets"><span>◆</span><small>Assety</small></button>
      </nav>
      <div class="fpm-bar-studios" hidden>
        <button data-shell-target="maze"><b>MAZE</b><span>Maze Studio</span></button>
        <button data-shell-target="word-search"><b>WS</b><span>Word Search</span></button>
        <button class="soon" disabled><b>▤</b><span>Book Builder · wkrótce</span></button>
      </div>
    </div>`;
  header.insertAdjacentElement('afterend',bar);

  const handle=bar.querySelector('.fpm-bar-handle');
  const content=bar.querySelector('.fpm-bar-content');
  const studios=bar.querySelector('.fpm-bar-studios');
  const studioToggle=bar.querySelector('[data-studios-toggle]');
  let open=false;

  function setOpen(next){
    open=Boolean(next);
    bar.classList.toggle('open',open);
    handle.setAttribute('aria-expanded',String(open));
    content.setAttribute('aria-hidden',String(!open));
    if(!open){studios.hidden=true;studioToggle.classList.remove('active')}
  }

  function go(target){
    if(target==='word-search'){
      setOpen(false);
      if(!isWordSearch)location.href='word-search.html';
      return;
    }
    if(isWordSearch){
      setOpen(false);
      location.href=target==='home'?'index.html':`index.html#${target}`;
      return;
    }
    const legacy=document.querySelector(`[data-view="${target}"]`)||document.querySelector(`[data-go="${target}"]`);
    if(legacy)legacy.click();
    if(target!=='home')history.replaceState(null,'',`#${target}`);else history.replaceState(null,'',location.pathname);
    setOpen(false);
  }

  handle.addEventListener('click',()=>setOpen(!open));
  studioToggle.addEventListener('click',()=>{
    studios.hidden=!studios.hidden;
    studioToggle.classList.toggle('active',!studios.hidden);
  });
  bar.querySelectorAll('[data-shell-target]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.shellTarget)));

  if(!isWordSearch&&location.hash){
    const target=location.hash.slice(1);
    if(['home','assets','pages','maze'].includes(target))setTimeout(()=>go(target),0);
  }
})();
