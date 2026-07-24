import{CartManager}from"../core/cart.js";
import{createRecipe,normalizeRecipe}from"../core/recipe.js";
import{renderMazePage,normalizeMazeSettings}from"./maze-page-renderer.js";

function clampInt(v,min,max,fallback){const n=parseInt(v,10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function makeSeed(){return(Date.now()+Math.floor(Math.random()*1e9))>>>0}

export function createMazeStudio({onCartChange=()=>{},onSaved=()=>{}}={}){
 const $=id=>document.querySelector(`#${id}`),canvas=$("mazeCanvas"),status=$("mazeStatus"),seedLabel=$("seedLabel"),add=$("addMazeToCart"),solution=$("showSolution");
 const fields={cols:$("cols"),rows:$("rows"),lineWidth:$("lineWidth"),title:$("pageTitle"),subtitle:$("mazeSubtitle"),instruction:$("mazeInstruction"),theme:$("mazeTheme"),assetCount:$("mazeAssetCount"),titleSize:$("mazeTitleSize"),titleY:$("mazeTitleY"),sideMargin:$("mazeSideMargin"),topMargin:$("mazeTopMargin"),bottomMargin:$("mazeBottomMargin"),mazeScale:$("mazeScale"),endpointMode:$("mazeEndpointMode"),wallStyle:$("mazeWallStyle"),frame:$("mazeFrame"),showPageNumber:$("mazeShowPageNumber"),pageNumber:$("mazePageNumber")};
 let seed=Date.now()>>>0,editingPageId=null,savedEndpoints=null,savedDecorations=null;
 function settings(){return normalizeMazeSettings({cols:clampInt(fields.cols.value,6,45,18),rows:clampInt(fields.rows.value,8,58,24),lineWidth:Number(fields.lineWidth.value),theme:fields.theme.value,assetCount:Number(fields.assetCount.value),titleSize:Number(fields.titleSize.value),titleY:Number(fields.titleY.value),subtitle:fields.subtitle.value.trim(),instruction:fields.instruction.value.trim(),sideMargin:Number(fields.sideMargin.value),topMargin:Number(fields.topMargin.value),bottomMargin:Number(fields.bottomMargin.value),mazeScale:Number(fields.mazeScale.value),endpointMode:fields.endpointMode.value,wallStyle:fields.wallStyle.value,frame:fields.frame.value,showPageNumber:fields.showPageNumber.checked,pageNumber:Number(fields.pageNumber.value),endpoints:savedEndpoints,decorations:savedDecorations})}
 function page(){return{module:"maze-studio",title:fields.title.value.trim()||"Find the Way!",seed,settings:settings()}}
 function draw(){renderMazePage(canvas,page(),{showSolution:solution.checked});seedLabel.textContent=`Seed: ${seed}`;status.textContent=`${fields.wallStyle.options[fields.wallStyle.selectedIndex]?.text||"Labirynt"} · ${fields.frame.options[fields.frame.selectedIndex]?.text||"bez ramki"}`}
 function markLayoutChanged(){savedEndpoints=null;savedDecorations=null;draw()}
 function resetEditing(){editingPageId=null;add.textContent="Dodaj do Koszyka Feniksa"}
 function recipe(){const p=page();return createRecipe({...p,meta:{previewImage:canvas.toDataURL("image/png")}})}
 function loadRecipe(source){const r=normalizeRecipe(source);if(r.module!=="maze-studio")return false;const s=normalizeMazeSettings(r.settings);editingPageId=source.id;seed=Number(r.seed)||makeSeed();fields.cols.value=s.cols;fields.rows.value=s.rows;fields.lineWidth.value=s.lineWidth;fields.title.value=r.title||"Find the Way!";fields.subtitle.value=s.subtitle;fields.instruction.value=s.instruction;fields.theme.value=s.theme;fields.assetCount.value=s.assetCount;fields.titleSize.value=s.titleSize;fields.titleY.value=s.titleY;fields.sideMargin.value=s.sideMargin;fields.topMargin.value=s.topMargin;fields.bottomMargin.value=s.bottomMargin;fields.mazeScale.value=s.mazeScale;fields.endpointMode.value=s.endpointMode;fields.wallStyle.value=s.wallStyle;fields.frame.value=s.frame;fields.showPageNumber.checked=s.showPageNumber;fields.pageNumber.value=s.pageNumber;savedEndpoints=s.endpoints;savedDecorations=s.decorations;solution.checked=false;add.textContent="Zapisz zmiany";draw();status.textContent="Edytujesz stronę z Koszyka";return true}
 document.querySelectorAll("[data-difficulty]").forEach(button=>button.onclick=()=>{const presets={easy:[10,14,7],medium:[18,24,5],hard:[28,38,3]},v=presets[button.dataset.difficulty];fields.cols.value=v[0];fields.rows.value=v[1];fields.lineWidth.value=v[2];document.querySelectorAll("[data-difficulty]").forEach(x=>x.classList.toggle("active",x===button));seed=makeSeed();markLayoutChanged()});
 $("newVariant").onclick=()=>{seed=makeSeed();savedEndpoints=null;savedDecorations=null;draw()};
 $("duplicateMaze").onclick=()=>{draw();status.textContent="Ten sam układ i ustawienia zachowane"};
 $("downloadMaze").onclick=()=>{const a=document.createElement("a");a.download=`fenix-maze-${seed}.png`;a.href=canvas.toDataURL("image/png");a.click()};
 solution.onchange=draw;
 [fields.cols,fields.rows,fields.endpointMode].forEach(x=>x.onchange=()=>{seed=makeSeed();markLayoutChanged()});
 [fields.theme,fields.assetCount].forEach(x=>x.oninput=()=>{savedDecorations=null;draw()});
 [fields.lineWidth,fields.title,fields.subtitle,fields.instruction,fields.titleSize,fields.titleY,fields.sideMargin,fields.topMargin,fields.bottomMargin,fields.mazeScale,fields.wallStyle,fields.frame,fields.showPageNumber,fields.pageNumber].forEach(x=>x.oninput=draw);
 add.onclick=()=>{draw();const r=recipe();if(editingPageId){CartManager.update(editingPageId,r);status.textContent="Zmiany zapisane — Koszyk odświeżony";resetEditing();onCartChange();onSaved()}else{CartManager.add(r);status.textContent="Dodano do Koszyka";onCartChange()}};
 fields.assetCount.value=0;draw();return{draw,loadRecipe,resetEditing,regenerate:()=>{seed=makeSeed();markLayoutChanged()}}
}
