"use strict";

const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)],clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
const PRESETS={"4-6":{easy:{cols:12,rows:16,lineWidth:7,mazeScale:92},medium:{cols:16,rows:20,lineWidth:6,mazeScale:96},hard:{cols:20,rows:26,lineWidth:5,mazeScale:100}},"5-7":{easy:{cols:14,rows:18,lineWidth:7,mazeScale:94},medium:{cols:18,rows:24,lineWidth:6,mazeScale:98},hard:{cols:24,rows:30,lineWidth:5,mazeScale:100}},"6-8":{easy:{cols:16,rows:22,lineWidth:6,mazeScale:95},medium:{cols:22,rows:28,lineWidth:5,mazeScale:99},hard:{cols:28,rows:36,lineWidth:4,mazeScale:100}}};
const LABELS={easy:'Łatwy',medium:'Średni',hard:'Trudny',custom:'Własny'};
let currentPageId=null,loadedEndpoints=null,renderTimer=null,renderSeq=0,applyingPreset=false;

function migrateLegacyFpm(){
  if(localStorage.getItem('fpm-fp-core-migrated-v1'))return;
  try{
    const legacy=JSON.parse(localStorage.getItem('fpm-preview-state')||'{"assets":[],"pages":[]}');
    const project=FenixCore.getActiveProject();
    if((project.pages?.length||0)===0&&Object.keys(project.assets||{}).length===0){
      (legacy.assets||[]).forEach(a=>{if(a?.data)FenixCore.putAsset({id:a.id,name:a.name||'Asset',filename:a.name||'Asset',dataUrl:a.data,source:'fpm-legacy',tags:Array.isArray(a.roles)?a.roles:[]})});
      (legacy.pages||[]).forEach(p=>{
        const module=p.module||'maze-studio',settings=clone(p.settings||{}),seed=p.seed??1,title=p.title||(module==='word-search-studio'?'Find the Words!':'Find the Way!');
        FenixCore.addPage({id:p.id,module,title,seed,recipe:{module,seed,title,settings,content:clone(p.content||{})},content:clone(p.content||{}),solution:{available:p.solution?.available!==false},source:{app:'fpm-legacy',version:'2.2',format:'migrated'}});
      });
    }
  }catch(error){console.warn('FPM legacy migration skipped',error)}
  localStorage.setItem('fpm-fp-core-migrated-v1','1');
}

function show(id){qsa('.view').forEach(v=>v.classList.toggle('active',v.id===id));qsa('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id));if(id==='assets')renderAssets();if(id==='pages')renderPages();if(id==='maze')renderMaze()}
qsa('[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));qsa('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));

function updateProjectHeader(){const p=FenixCore.getActiveProject();const el=qs('#projectName');if(el)el.textContent=p.name}

qs('#assetInput').onchange=e=>{[...e.target.files].forEach(file=>{const r=new FileReader();r.onload=()=>{FenixCore.putAsset({name:file.name,filename:file.name,mime:file.type||'image/png',dataUrl:r.result,source:'fpm-import',tags:[]});renderAssets();refreshSelects();scheduleRender()};r.readAsDataURL(file)});e.target.value=''};
window.toggleRole=(id,role)=>{const a=FenixCore.getAsset(id);if(!a)return;const tags=a.tags||[],next=tags.includes(role)?tags.filter(r=>r!==role):[...tags,role];FenixCore.updateAsset(id,{tags:next});renderAssets();refreshSelects();scheduleRender()};
function renderAssets(){const assets=FenixCore.listAssets();qs('#assetStatus').textContent=assets.length?assets.length+' assetów w projekcie.':'Brak assetów.';qs('#assetGrid').innerHTML=assets.map(a=>'<article class="asset"><img src="'+a.dataUrl+'"><b>'+a.name+'</b><div class="roles">'+['gameplay','content','deco'].map(r=>'<button class="'+((a.tags||[]).includes(r)?'on':'')+'" onclick="toggleRole(\''+a.id+'\',\''+r+'\')">'+r+'</button>').join('')+'</div></article>').join('')}
function refreshSelects(saved={}){const gp=FenixCore.findAssets({tag:'gameplay'}),dc=FenixCore.findAssets({tag:'deco'}),start=saved.startAssetRef??qs('#startAsset').value??'',goal=saved.goalAssetRef??qs('#goalAsset').value??'',deco=saved.decoAssetRefs?.[0]??qs('#decoAsset').value??'';qs('#startAsset').innerHTML='<option value="">S</option>'+gp.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('');qs('#goalAsset').innerHTML='<option value="">M</option>'+gp.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('');qs('#decoAsset').innerHTML='<option value="">Brak</option>'+dc.map(a=>'<option value="'+a.id+'">'+a.name+'</option>').join('');qs('#startAsset').value=gp.some(a=>a.id===start)?start:'';qs('#goalAsset').value=gp.some(a=>a.id===goal)?goal:'';qs('#decoAsset').value=dc.some(a=>a.id===deco)?deco:''}

function settings(){return{ageProfile:qs('#age').value,difficulty:qs('#difficulty').value,cols:+qs('#cols').value||12,rows:+qs('#rows').value||16,lineWidth:+qs('#lineWidth').value||7,titleSize:42,titleY:82,subtitle:'',instruction:qs('#instruction').value||'',sideMargin:+qs('#sideMargin').value||80,topMargin:+qs('#topMargin').value||170,bottomMargin:+qs('#bottomMargin').value||90,mazeScale:+qs('#mazeScale').value||92,endpointMode:qs('#endpointMode').value,wallStyle:qs('#wallStyle').value,showSolution:qs('#solution').value==='yes',startAssetRef:qs('#startAsset').value||null,goalAssetRef:qs('#goalAsset').value||null,startAssetScale:+qs('#startScale').value||100,goalAssetScale:+qs('#goalScale').value||100,decoAssetRefs:qs('#decoAsset').value?[qs('#decoAsset').value]:[],decoCount:+qs('#decoCount').value||0,decoScale:+qs('#decoScale').value||80,endpoints:clone(loadedEndpoints)}}
function draft(){const s=settings(),seed=+qs('#seed').value||1,title=qs('#title').value.trim()||'Find the Way!';return FenixPageSchema.normalize({module:'maze-studio',title,seed,recipe:{module:'maze-studio',seed,title,settings:s,meta:{createdWith:'FPM',renderState:{showSolution:s.showSolution,endpoints:s.endpoints}}},solution:{available:true},production:{format:'8.5x11',bleed:'no-bleed',dpi:300,width:2550,height:3300},source:{app:'fenix-portable-mobile',version:'3.0',format:'native'}})}
function updateDifficultyInfo(){const age=qs('#age').value,d=qs('#difficulty').value,p=PRESETS[age]?.[d];qs('#difficultyInfo').textContent=d==='custom'?`Profil ${age} lat · Własny: ręczne parametry są aktywne.`:p?`Profil ${age} lat · ${LABELS[d]} · siatka ${p.cols}×${p.rows} · ściany ${p.lineWidth}px · skala ${p.mazeScale}%.`:`Profil ${age} lat.`}
function applyPreset(){const age=qs('#age').value,d=qs('#difficulty').value;if(d==='custom'){updateDifficultyInfo();scheduleRender();return}const p=PRESETS[age]?.[d];if(!p)return;applyingPreset=true;qs('#cols').value=p.cols;qs('#rows').value=p.rows;qs('#lineWidth').value=p.lineWidth;qs('#mazeScale').value=p.mazeScale;applyingPreset=false;loadedEndpoints=null;updateDifficultyInfo();scheduleRender()}
function markCustom(){if(applyingPreset)return;if(qs('#difficulty').value!=='custom')qs('#difficulty').value='custom';updateDifficultyInfo()}
async function loadAssetImages(refs){const out={};await Promise.all([...new Set(refs.filter(Boolean))].map(id=>new Promise(resolve=>{const a=FenixCore.getAsset(id);if(!a?.dataUrl)return resolve();const img=new Image();img.onload=()=>{out[id]=img;resolve()};img.onerror=resolve;img.src=a.dataUrl})));return out}
async function renderMaze(){if(!window.FenixMaze){qs('#mazeStatus').textContent='Błąd: renderer FP Maze nie został załadowany.';return}const seq=++renderSeq,page=draft(),s=page.recipe.settings;qs('#mazeStatus').textContent='Odświeżam podgląd…';const refs=[s.startAssetRef,s.goalAssetRef,...s.decoAssetRefs],assetImages=await loadAssetImages(refs);if(seq!==renderSeq)return;const result=FenixMaze.render(page,{solution:s.showSolution,width:900,height:1165,canvas:qs('#mazeCanvas'),assetImages});loadedEndpoints=clone(result.endpoints);qs('#mazeStatus').textContent=`Gotowy · ${s.ageProfile} lat · ${LABELS[s.difficulty]||s.difficulty} · ${s.cols}×${s.rows} · seed ${page.recipe.seed} · rozwiązanie ${s.showSolution?'tak':'nie'} · deco ${result.decorations?.length||0}`;updateDifficultyInfo()}
function scheduleRender(kind='visual'){clearTimeout(renderTimer);if(kind==='geometry'||kind==='seed')loadedEndpoints=null;renderTimer=setTimeout(renderMaze,140)}

function loadPage(id){const raw=FenixCore.getCart().find(x=>String(x.id)===String(id));if(!raw||FenixPageSchema.moduleOf(raw)!=='maze-studio')return;const p=FenixPageSchema.normalize(raw),s=p.recipe.settings||{};currentPageId=p.id;qs('#title').value=p.title||'Find the Way!';qs('#instruction').value=s.instruction||'';qs('#age').value=s.ageProfile||'4-6';qs('#difficulty').value=s.difficulty||'custom';['cols','rows','lineWidth','sideMargin','topMargin','bottomMargin','mazeScale','startScale','goalScale','decoCount','decoScale'].forEach(id2=>{const map={startScale:'startAssetScale',goalScale:'goalAssetScale'};if(s[map[id2]||id2]!=null)qs('#'+id2).value=s[map[id2]||id2]});qs('#endpointMode').value=s.endpointMode||'random';qs('#wallStyle').value=s.wallStyle||'clean';qs('#seed').value=p.recipe.seed??1;qs('#solution').value=s.showSolution?'yes':'no';loadedEndpoints=clone(s.endpoints||null);refreshSelects(s);qs('#savePage').textContent='Zapisz zmiany';show('maze')}
window.openFpmPage=id=>{const p=FenixCore.getCart().find(x=>String(x.id)===String(id));if(!p)return;const mod=FenixPageSchema.moduleOf(p);if(mod==='maze-studio')loadPage(id);else if(mod==='word-search-studio')location.href='word-search.html?id='+encodeURIComponent(id)};
function renderPages(){const pages=FenixCore.getCart().map(FenixPageSchema.normalize);qs('#pageList').innerHTML=pages.length?pages.map((p,i)=>{const s=p.recipe.settings||{},short=p.module==='maze-studio'?'MAZE':p.module==='word-search-studio'?'WS':p.module;return '<article class="page" onclick="openFpmPage(\''+p.id+'\')"><b>'+(i+1)+'. '+short+' · '+p.title+'</b><small>'+((s.cols&&s.rows)?s.cols+'×'+s.rows+' · ':'')+'seed '+(p.recipe.seed??'—')+'</small></article>'}).join(''):'<article class="card"><b>Brak stron.</b><p>Utwórz pierwszą stronę w Studio.</p></article>'}

qs('#age').onchange=()=>{if(qs('#difficulty').value!=='custom')applyPreset();else scheduleRender()};qs('#difficulty').onchange=applyPreset;
['cols','rows','lineWidth','mazeScale'].forEach(id=>qs('#'+id).addEventListener('input',()=>{markCustom();scheduleRender('geometry')}));
['endpointMode','sideMargin','topMargin','bottomMargin'].forEach(id=>qs('#'+id).addEventListener('change',()=>scheduleRender('geometry')));
['title','instruction','wallStyle','solution','startAsset','goalAsset','startScale','goalScale','decoAsset','decoCount','decoScale'].forEach(id=>qs('#'+id).addEventListener('input',()=>scheduleRender()));
qs('#seed').addEventListener('input',()=>scheduleRender('seed'));
qs('#variant').onclick=()=>{qs('#seed').value=(+qs('#seed').value||1)+1;currentPageId=null;qs('#savePage').textContent='Dodaj do Stron projektu';scheduleRender('seed')};
qs('#savePage').onclick=()=>{const page=draft();page.recipe.settings.endpoints=clone(loadedEndpoints);if(currentPageId)FenixCore.updatePage(currentPageId,page);else{const saved=FenixCore.addPage(page);currentPageId=saved.id}renderPages();qs('#savePage').textContent='Zapisz zmiany';alert('Strona zapisana w wspólnym projekcie FENIX.')};
window.addEventListener('fenix-state-change',()=>{updateProjectHeader();renderPages()});

migrateLegacyFpm();updateProjectHeader();renderAssets();refreshSelects();renderPages();applyPreset();renderMaze();
const startId=new URLSearchParams(location.search).get('id');if(startId)setTimeout(()=>loadPage(startId),0);
