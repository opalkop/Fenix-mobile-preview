import{CartManager}from"../core/cart.js";
import{ProjectManager}from"../core/projects.js";
import{createRecipe,normalizeRecipe}from"../core/recipe.js";
import{renderMazePage,normalizeMazeSettings}from"./maze-page-renderer.js";

function clampInt(v,min,max,fallback){const n=parseInt(v,10);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback}
function makeSeed(){return(Date.now()+Math.floor(Math.random()*1e9))>>>0}
function safeNumber(input,fallback){const n=Number(input?.value);return Number.isFinite(n)?n:fallback}
function removeStoredPreviews(){const project=ProjectManager.ensure(),pages=(project.pages||[]).map(page=>{const copy=structuredClone(page);if(copy.recipe?.meta?.previewImage)delete copy.recipe.meta.previewImage;if(copy.meta?.previewImage)delete copy.meta.previewImage;return copy});ProjectManager.update(project.id,{pages})}

export function createMazeStudio({onCartChange=()=>{},onSaved=()=>{}}={}){
 const $=id=>document.querySelector(`#${id}`),canvas=$("mazeCanvas"),status=$("mazeStatus"),seedLabel=$("seedLabel"),add=$("addMazeToCart"),solution=$("showSolution");
 const fields={cols:$("cols"),rows:$("rows"),lineWidth:$("lineWidth"),title:$("pageTitle"),subtitle:$("mazeSubtitle"),instruction:$("mazeInstruction"),theme:$("mazeTheme"),assetCount:$("mazeAssetCount"),titleSize:$("mazeTitleSize"),titleY:$("mazeTitleY"),sideMargin:$("mazeSideMargin"),topMargin:$("mazeTopMargin"),bottomMargin:$("mazeBottomMargin"),mazeScale:$("mazeScale"),endpointMode:$("mazeEndpointMode"),wallStyle:$("mazeWallStyle"),frame:$("mazeFrame"),showPageNumber:$("mazeShowPageNumber"),pageNumber:$("mazePageNumber")};
 let seed=Date.now()>>>0,editingPageId=null,savedEndpoints=null,savedDecorations=null;
 function settings(){return normalizeMazeSettings({cols:clampInt(fields.cols.value,6,45,18),rows:clampInt(fields.rows.value,8,58,24),lineWidth:safeNumber(fields.lineWidth,5),theme:fields.theme.value,assetCount:safeNumber(fields.assetCount,0),titleSize:safeNumber(fields.titleSize,42),titleY:safeNumber(fields.titleY,82),subtitle:fields.subtitle.value.trim(),instruction:fields.instruction.value.trim(),sideMargin:safeNumber(fields.sideMargin,80),topMargin:safeNumber(fields.topMargin,170),bottomMargin:safeNumber(fields.bottomMargin,90),mazeScale:safeNumber(fields.mazeScale,100),endpointMode:fields.endpointMode.value,wallStyle:fields.wallStyle.value,frame:fields.frame.value,showPageNumber:fields.showPageNumber.checked,pageNumber:safeNumber(fields.pageNumber,1),endpoints:savedEndpoints,decorations:savedDecorations})}
 function page(){return{module:"maze-studio",title:fields.title.value.trim()||"Find the Way!",seed,settings:settings()}}
 function draw(){renderMazePage(canvas,page(),{showSolution:solution.checked});seedLabel.textContent=`Seed: ${seed}`;status.textContent=`${fields.wallStyle.options[fields.wallStyle.selectedIndex]?.text||"Labirynt"} · ${fields.frame.options[fields.frame.selectedIndex]?.text||"bez ramki"}`}
 function markLayoutChanged(){savedEndpoints=null;savedDecorations=null;draw()}
 function resetEditing(){editingPageId=null;add.textContent="Dodaj do Koszyka Feniksa"}
 function recipe(){return createRecipe({...page(),meta:{}})}
 function writeCart(){const r=recipe();return editingPageId?CartManager.update(editingPageId,r):CartManager.add(r)}
 function saveToCart(){draw();add.disabled=true;add.textContent="Zapisywanie…";let result=null;try{result=writeCart()}catch(error){console.warn("Maze cart save failed; clearing old previews",error);try{removeStoredPreviews();result=writeCart()}catch(secondError){console.error("Maze cart save failed after cleanup",secondError);status.textContent="Nie udało się zapisać strony — pamięć aplikacji jest pełna.";alert("Nie udało się dodać strony do Koszyka Feniksa.");add.disabled=false;add.textContent=editingPageId?"Zapisz zmiany":"Dodaj do Koszyka Feniksa";return}}
 if(!result){status.textContent="Nie udało się zapisać strony w aktywnym projekcie.";add.disabled=false;add.textContent=editingPageId?"Zapisz zmiany":"Dodaj do Koszyka Feniksa";return}
 const wasEditing=Boolean(editingPageId);status.textContent=wasEditing?"Zmiany zapisane — otwieram Koszyk":"Dodano do Koszyka — otwieram Koszyk";resetEditing();onCartChange();onSaved();add.disabled=false}
 function loadRecipe(source){const r=normalizeRecipe(source);if(r.module!=="maze-studio")return false;const s=normalizeMazeSettings(r.settings);editingPageId=source.id;seed=Number(r.seed)||makeSeed();fields.cols.value=s.cols;fields.rows.value=s.rows;fields.lineWidth.value=s.lineWidth;fields.title.value=r.title||"Find the Way!";fields.subtitle.value=s.subtitle;fields.instruction.value=s.instruction;fields.theme.value=s.theme;fields.assetCount.value=s.assetCount;fields.titleSize.value=s.titleSize;fields.titleY.value=s.titleY;fields.sideMargin.value=s.sideMargin;fields.topMargin.value=s.topMargin;fields.bottomMargin.value=s.bottomMargin;fields.mazeScale.value=s.mazeScale;fields.endpointMode.value=s.endpointMode;fields.wallStyle.value=s.wallStyle;fields.frame.value=s.frame;fields.showPageNumber.checked=s.showPageNumber;fields.pageNumber.value=s.pageNumber;savedEndpoints=s.endpoints;savedDecorations=s.decorations;solution.checked=false;add.textContent="Zapisz zmiany";draw();status.textContent="Edytujesz stronę z Koszyka";return true}
 document.querySelectorAll("[data-difficulty]").forEach(button=>button.onclick=()=>{const presets={easy:[10,14,7],medium:[18,24,5],hard:[28,38,3]},v=presets[button.dataset.difficulty];fields.cols.value=v[0];fields.rows.value=v[1];fields.lineWidth.value=v[2];document.querySelectorAll("[data-difficulty]").forEach(x=>x.classList.toggle("active",x===button));seed=makeSeed();markLayoutChanged()});
 $("newVariant").onclick=()=>{seed=makeSeed();savedEndpoints=null;savedDecorations=null;draw()};
 $("duplicateMaze").onclick=()=>{draw();status.textContent="Ten sam układ i ustawienia zachowane"};
 $("downloadMaze").onclick=()=>{const a=document.createElement("a");a.download=`fenix-maze-${seed}.png`;a.href=canvas.toDataURL("image/png");a.click()};
 solution.onchange=draw;
 [fields.cols,fields.rows,fields.endpointMode].forEach(x=>x.onchange=()=>{seed=makeSeed();markLayoutChanged()});
 [fields.theme,fields.assetCount].forEach(x=>x.oninput=()=>{savedDecorations=null;draw()});
 [fields.lineWidth,fields.title,fields.subtitle,fields.instruction,fields.titleSize,fields.titleY,fields.sideMargin,fields.topMargin,fields.bottomMargin,fields.mazeScale,fields.wallStyle,fields.frame,fields.showPageNumber,fields.pageNumber].forEach(x=>x.oninput=draw);
 add.onclick=saveToCart;
 fields.assetCount.value=0;draw();return{draw,loadRecipe,resetEditing,regenerate:()=>{seed=makeSeed();markLayoutChanged()}}
}