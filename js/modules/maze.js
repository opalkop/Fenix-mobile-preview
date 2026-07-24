import{CartManager}from"../core/cart.js";
import{createRecipe,normalizeRecipe}from"../core/recipe.js";
import{renderMazePage,normalizeMazeSettings}from"./maze-page-renderer.js";

function clampInt(v,min,max,fallback){const n=parseInt(v,10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function makeSeed(){return(Date.now()+Math.floor(Math.random()*1e9))>>>0}

function setupMobileSafeRanges(root){
 if(!root||root.dataset.safeRangesReady)return()=>{};
 root.dataset.safeRangesReady="true";
 if(!document.querySelector('style[data-maze-safe-ranges]')){
  const style=document.createElement("style");style.dataset.mazeSafeRanges="true";style.textContent=`
  .maze-range-control{display:grid;grid-template-columns:44px 1fr 44px;gap:8px;align-items:center;margin-top:2px}
  .maze-range-control button{min-height:44px;border:0;border-radius:11px;background:#e8edf3;font-size:1.25rem;font-weight:900}
  .maze-range-value{display:grid;place-items:center;min-height:44px;border:1px solid #cbd5e1;border-radius:11px;background:#fff;font-weight:900;font-variant-numeric:tabular-nums}
  .maze-range-note{display:none;color:#64748b;font-size:.72rem;font-weight:600;margin-top:3px}
  @media(pointer:coarse){#view-maze input[type=range]{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important;overflow:hidden!important}.maze-range-note{display:block}.maze-range-control button{display:block}}
  @media(pointer:fine){.maze-range-control{grid-template-columns:1fr}.maze-range-control button{display:none}.maze-range-value{min-height:32px;background:transparent;border:0;justify-content:end;padding-right:4px}}
  `;document.head.append(style)
 }
 const controls=[];
 root.querySelectorAll('input[type="range"]').forEach(input=>{
  const label=input.closest("label"),name=(label?.childNodes?.[0]?.textContent||input.id||"wartość").trim();
  const box=document.createElement("div");box.className="maze-range-control";
  const minus=document.createElement("button"),value=document.createElement("output"),plus=document.createElement("button"),note=document.createElement("small");
  minus.type=plus.type="button";minus.textContent="−";plus.textContent="+";minus.setAttribute("aria-label",`Zmniejsz: ${name}`);plus.setAttribute("aria-label",`Zwiększ: ${name}`);value.className="maze-range-value";value.htmlFor=input.id;note.className="maze-range-note";note.textContent="Na telefonie użyj przycisków − / +, aby przypadkiem nie zmieniać wartości podczas przewijania.";
  box.append(minus,value,plus);input.insertAdjacentElement("afterend",box);box.insertAdjacentElement("afterend",note);
  const sync=()=>{value.value=input.value;value.textContent=input.value};
  const step=direction=>{const min=Number(input.min||0),max=Number(input.max||100),amount=Number(input.step||1),next=Math.min(max,Math.max(min,Number(input.value)+direction*amount));if(next===Number(input.value))return;input.value=String(next);sync();input.dispatchEvent(new Event("input",{bubbles:true}));input.dispatchEvent(new Event("change",{bubbles:true}))};
  minus.onclick=()=>step(-1);plus.onclick=()=>step(1);input.addEventListener("input",sync);input.addEventListener("change",sync);sync();controls.push(sync)
 });
 return()=>controls.forEach(sync)
}

export function createMazeStudio({onCartChange=()=>{},onSaved=()=>{}}={}){
 const $=id=>document.querySelector(`#${id}`),canvas=$("mazeCanvas"),status=$("mazeStatus"),seedLabel=$("seedLabel"),add=$("addMazeToCart"),solution=$("showSolution");
 const fields={cols:$("cols"),rows:$("rows"),lineWidth:$("lineWidth"),title:$("pageTitle"),subtitle:$("mazeSubtitle"),instruction:$("mazeInstruction"),theme:$("mazeTheme"),assetCount:$("mazeAssetCount"),titleSize:$("mazeTitleSize"),titleY:$("mazeTitleY"),sideMargin:$("mazeSideMargin"),topMargin:$("mazeTopMargin"),bottomMargin:$("mazeBottomMargin"),mazeScale:$("mazeScale"),endpointMode:$("mazeEndpointMode"),wallStyle:$("mazeWallStyle"),frame:$("mazeFrame"),showPageNumber:$("mazeShowPageNumber"),pageNumber:$("mazePageNumber")};
 const syncRangeControls=setupMobileSafeRanges(document.querySelector("#view-maze"));
 let seed=Date.now()>>>0,editingPageId=null,savedEndpoints=null,savedDecorations=null;
 function settings(){return normalizeMazeSettings({cols:clampInt(fields.cols.value,6,45,18),rows:clampInt(fields.rows.value,8,58,24),lineWidth:Number(fields.lineWidth.value),theme:fields.theme.value,assetCount:Number(fields.assetCount.value),titleSize:Number(fields.titleSize.value),titleY:Number(fields.titleY.value),subtitle:fields.subtitle.value.trim(),instruction:fields.instruction.value.trim(),sideMargin:Number(fields.sideMargin.value),topMargin:Number(fields.topMargin.value),bottomMargin:Number(fields.bottomMargin.value),mazeScale:Number(fields.mazeScale.value),endpointMode:fields.endpointMode.value,wallStyle:fields.wallStyle.value,frame:fields.frame.value,showPageNumber:fields.showPageNumber.checked,pageNumber:Number(fields.pageNumber.value),endpoints:savedEndpoints,decorations:savedDecorations})}
 function page(){return{module:"maze-studio",title:fields.title.value.trim()||"Find the Way!",seed,settings:settings()}}
 function draw(){renderMazePage(canvas,page(),{showSolution:solution.checked});seedLabel.textContent=`Seed: ${seed}`;status.textContent=`${fields.wallStyle.options[fields.wallStyle.selectedIndex]?.text||"Labirynt"} · ${fields.frame.options[fields.frame.selectedIndex]?.text||"bez ramki"}`;syncRangeControls()}
 function markLayoutChanged(){savedEndpoints=null;savedDecorations=null;draw()}
 function resetEditing(){editingPageId=null;add.textContent="Dodaj do Koszyka Feniksa"}
 function recipe(){const p=page();return createRecipe({...p,meta:{previewImage:canvas.toDataURL("image/png")}})}
 function loadRecipe(source){const r=normalizeRecipe(source);if(r.module!=="maze-studio")return false;const s=normalizeMazeSettings(r.settings);editingPageId=source.id;seed=Number(r.seed)||makeSeed();fields.cols.value=s.cols;fields.rows.value=s.rows;fields.lineWidth.value=s.lineWidth;fields.title.value=r.title||"Find the Way!";fields.subtitle.value=s.subtitle;fields.instruction.value=s.instruction;fields.theme.value=s.theme;fields.assetCount.value=s.assetCount;fields.titleSize.value=s.titleSize;fields.titleY.value=s.titleY;fields.sideMargin.value=s.sideMargin;fields.topMargin.value=s.topMargin;fields.bottomMargin.value=s.bottomMargin;fields.mazeScale.value=s.mazeScale;fields.endpointMode.value=s.endpointMode;fields.wallStyle.value=s.wallStyle;fields.frame.value=s.frame;fields.showPageNumber.checked=s.showPageNumber;fields.pageNumber.value=s.pageNumber;savedEndpoints=s.endpoints;savedDecorations=s.decorations;solution.checked=false;add.textContent="Zapisz zmiany";syncRangeControls();draw();status.textContent="Edytujesz stronę z Koszyka";return true}
 document.querySelectorAll("[data-difficulty]").forEach(button=>button.onclick=()=>{const presets={easy:[10,14,7],medium:[18,24,5],hard:[28,38,3]},v=presets[button.dataset.difficulty];fields.cols.value=v[0];fields.rows.value=v[1];fields.lineWidth.value=v[2];document.querySelectorAll("[data-difficulty]").forEach(x=>x.classList.toggle("active",x===button));seed=makeSeed();syncRangeControls();markLayoutChanged()});
 $("newVariant").onclick=()=>{seed=makeSeed();savedEndpoints=null;savedDecorations=null;draw()};
 $("duplicateMaze").onclick=()=>{draw();status.textContent="Ten sam układ i ustawienia zachowane"};
 $("downloadMaze").onclick=()=>{const a=document.createElement("a");a.download=`fenix-maze-${seed}.png`;a.href=canvas.toDataURL("image/png");a.click()};
 solution.onchange=draw;
 [fields.cols,fields.rows,fields.endpointMode].forEach(x=>x.onchange=()=>{seed=makeSeed();markLayoutChanged()});
 [fields.theme,fields.assetCount].forEach(x=>x.oninput=()=>{savedDecorations=null;draw()});
 [fields.lineWidth,fields.title,fields.subtitle,fields.instruction,fields.titleSize,fields.titleY,fields.sideMargin,fields.topMargin,fields.bottomMargin,fields.mazeScale,fields.wallStyle,fields.frame,fields.showPageNumber,fields.pageNumber].forEach(x=>x.oninput=draw);
 add.onclick=()=>{draw();const r=recipe();if(editingPageId){CartManager.update(editingPageId,r);status.textContent="Zmiany zapisane — Koszyk odświeżony";resetEditing();onCartChange();onSaved()}else{CartManager.add(r);status.textContent="Dodano do Koszyka";onCartChange()}};
 fields.assetCount.value=0;syncRangeControls();draw();return{draw,loadRecipe,resetEditing,regenerate:()=>{seed=makeSeed();markLayoutChanged()}}
}