(()=>{
  const isWordSearch=/word-search\.html(?:$|[?#])/.test(location.href);
  const root=document.createElement('div');
  root.className='fpm-shell';
  root.innerHTML=`
    <div class="fpm-shell-backdrop" data-shell-close></div>
    <section class="fpm-sheet" data-state="peek" aria-label="Panel FPM">
      <button class="fpm-sheet-handle" type="button" aria-label="Rozwiń panel FPM"><span></span></button>
      <div class="fpm-sheet-head">
        <div><small>FPM 2.0</small><strong>Centrum sterowania</strong></div>
        <span class="fpm-sheet-state">przeciągnij</span>
      </div>
      <div class="fpm-sheet-content">
        <div class="fpm-quick-grid">
          <button data-shell-target="assets"><span>◆</span><b>Assety</b><small>Biblioteka projektu</small></button>
          <button data-shell-target="pages"><span>▣</span><b>Strony</b><small>Aktualny projekt</small></button>
        </div>
        <div class="fpm-sheet-section"><span>STUDIA</span></div>
        <div class="fpm-studio-list">
          <button data-shell-target="maze"><span class="studio-mark">MAZE</span><div><b>Maze Studio</b><small>Labirynty i rozwiązania</small></div><i>›</i></button>
          <button data-shell-target="word-search"><span class="studio-mark">WS</span><div><b>Word Search Studio</b><small>Wykreślanki i klucze odpowiedzi</small></div><i>›</i></button>
        </div>
        <div class="fpm-sheet-section"><span>SKŁAD</span></div>
        <button class="fpm-builder-card" disabled><span>▤</span><div><b>Book Builder</b><small>Następny etap rozwoju FPM</small></div><em>WKRÓTCE</em></button>
      </div>
    </section>
    <nav class="fpm-dock" aria-label="Główna nawigacja FPM">
      <button data-shell-target="home"><span>⌂</span><small>Start</small></button>
      <button data-shell-target="pages"><span>▣</span><small>Projekt</small></button>
      <button class="fpm-dock-main" data-shell-open><span>＋</span><small>Studia</small></button>
      <button data-shell-target="assets"><span>◆</span><small>Assety</small></button>
    </nav>`;
  document.body.appendChild(root);

  const sheet=root.querySelector('.fpm-sheet'),backdrop=root.querySelector('.fpm-shell-backdrop'),handle=root.querySelector('.fpm-sheet-handle');
  const states=['peek','half','full'];
  let state='peek',startY=0,startTranslate=0,dragging=false;
  const stateTranslate=()=>state==='full'?8:state==='half'?46:calcPeek();
  function calcPeek(){return Math.max(72,window.innerHeight-150)}
  function translateFor(s){return s==='full'?8:s==='half'?Math.round(window.innerHeight*.46):calcPeek()}
  function apply(next,animate=true){state=states.includes(next)?next:'peek';sheet.dataset.state=state;sheet.style.transition=animate?'transform .28s cubic-bezier(.2,.8,.2,1)':'none';sheet.style.transform=`translateY(${translateFor(state)}px)`;root.classList.toggle('sheet-open',state!=='peek');root.querySelector('.fpm-sheet-state').textContent=state==='full'?'pełny ekran':state==='half'?'panel aktywny':'przeciągnij';setTimeout(()=>sheet.style.transition='',300)}
  function cycle(){apply(state==='peek'?'half':state==='half'?'full':'peek')}
  function go(target){
    if(target==='word-search'){if(!isWordSearch)location.href='word-search.html';else apply('peek');return}
    if(isWordSearch){location.href=`index.html#${target}`;return}
    const legacy=document.querySelector(`[data-view="${target}"]`)||document.querySelector(`[data-go="${target}"]`);
    if(legacy)legacy.click();
    if(target!=='home')history.replaceState(null,'',`#${target}`);else history.replaceState(null,'',location.pathname);
    apply('peek');
  }
  root.querySelectorAll('[data-shell-target]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.shellTarget)));
  root.querySelector('[data-shell-open]').addEventListener('click',()=>apply(state==='peek'?'half':'peek'));
  root.querySelector('[data-shell-close]').addEventListener('click',()=>apply('peek'));
  handle.addEventListener('click',e=>{if(!dragging)cycle()});
  handle.addEventListener('pointerdown',e=>{dragging=true;startY=e.clientY;startTranslate=translateFor(state);handle.setPointerCapture?.(e.pointerId);sheet.style.transition='none'});
  handle.addEventListener('pointermove',e=>{if(!dragging)return;const next=Math.max(8,Math.min(calcPeek(),startTranslate+(e.clientY-startY)));sheet.style.transform=`translateY(${next}px)`});
  const finish=e=>{if(!dragging)return;dragging=false;const current=sheet.getBoundingClientRect().top;const full=translateFor('full'),half=translateFor('half'),peek=translateFor('peek');const distances=[[Math.abs(current-full),'full'],[Math.abs(current-half),'half'],[Math.abs(current-peek),'peek']].sort((a,b)=>a[0]-b[0]);apply(distances[0][1])};
  handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);
  window.addEventListener('resize',()=>apply(state,false));
  if(!isWordSearch&&location.hash){const target=location.hash.slice(1);if(['home','assets','pages','maze'].includes(target))setTimeout(()=>go(target),0)}
  apply('peek',false);
})();
