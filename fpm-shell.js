(()=>{
  const isWordSearch=/word-search\.html(?:$|[?#])/.test(location.href);
  const root=document.createElement('div');
  root.className='fpm-shell';
  root.innerHTML=`
    <section class="fpm-control-center" aria-hidden="true">
      <header class="fpm-control-head">
        <div><small>FPM 2.0</small><strong>Centrum sterowania</strong><span>Wybierz miejsce pracy. Widok projektu pozostaje nienaruszony.</span></div>
        <button type="button" data-shell-back aria-label="Wróć do projektu">×</button>
      </header>
      <div class="fpm-control-scroll">
        <div class="fpm-control-kicker">PROJEKT</div>
        <div class="fpm-quick-grid">
          <button data-shell-target="pages"><span>▣</span><b>Strony projektu</b><small>Aktualny skład i zapisane strony</small></button>
          <button data-shell-target="assets"><span>◆</span><b>Assety projektu</b><small>Gameplay / Content / Deco</small></button>
        </div>
        <div class="fpm-control-kicker">STUDIA</div>
        <div class="fpm-studio-list">
          <button data-shell-target="maze"><span class="studio-mark">MAZE</span><div><b>Maze Studio</b><small>Labirynty i rozwiązania</small></div><i>›</i></button>
          <button data-shell-target="word-search"><span class="studio-mark">WS</span><div><b>Word Search Studio</b><small>Wykreślanki i klucze odpowiedzi</small></div><i>›</i></button>
        </div>
        <div class="fpm-control-kicker">SKŁAD</div>
        <button class="fpm-builder-card" disabled><span>▤</span><div><b>Book Builder</b><small>Następny etap rozwoju FPM</small></div><em>WKRÓTCE</em></button>
      </div>
    </section>
    <nav class="fpm-dock" aria-label="Główna nawigacja FPM">
      <button data-shell-target="home"><span>⌂</span><small>Start</small></button>
      <button data-shell-target="pages"><span>▣</span><small>Projekt</small></button>
      <button class="fpm-dock-main" data-shell-open><span>⌃</span><small>Studia</small></button>
      <button data-shell-target="assets"><span>◆</span><small>Assety</small></button>
    </nav>`;
  document.body.appendChild(root);

  const center=root.querySelector('.fpm-control-center');
  let open=false;
  const setOpen=next=>{
    open=Boolean(next);
    document.body.classList.toggle('fpm-control-open',open);
    center.setAttribute('aria-hidden',String(!open));
    root.querySelector('[data-shell-open]').classList.toggle('active',open);
    if(open)center.scrollTop=0;
  };
  const go=target=>{
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
  };
  root.querySelectorAll('[data-shell-target]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.shellTarget)));
  root.querySelector('[data-shell-open]').addEventListener('click',()=>setOpen(!open));
  root.querySelector('[data-shell-back]').addEventListener('click',()=>setOpen(false));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&open)setOpen(false)});
  if(!isWordSearch&&location.hash){const target=location.hash.slice(1);if(['home','assets','pages','maze'].includes(target))setTimeout(()=>go(target),0)}
})();
