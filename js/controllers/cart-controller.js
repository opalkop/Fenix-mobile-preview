import{ProjectManager}from"../core/projects.js";
import{CartManager}from"../core/cart.js";
import{AppState}from"../core/app-state.js";
import{ModuleRegistry}from"../core/module-registry.js";
import{renderPageThumbnail,renderPagePreview}from"../core/thumbnails.js";
import{esc}from"../ui/helpers.js";

if(!document.querySelector('link[data-preview-styles]')){const link=document.createElement("link");link.rel="stylesheet";link.href="css/preview.css";link.dataset.previewStyles="true";document.head.append(link)}

export function createCartController({router,editors}){
  const box=document.querySelector("#cartList"),dialog=document.querySelector("#pagePreviewDialog"),previewCanvas=document.querySelector("#pagePreviewCanvas"),previewTitle=document.querySelector("#pagePreviewTitle"),previewMeta=document.querySelector("#pagePreviewMeta");
  const menu=document.createElement("div");menu.className="cart-context-menu";menu.hidden=true;document.body.append(menu);
  let previewPage=null,longPressed=false;

  function currentPage(id){return CartManager.pages().find(page=>page.id===id)||null}
  function openEditor(page){
    page=currentPage(page?.id)||page;
    if(!page)return;
    const view=ModuleRegistry.editorView(page),editor=editors[page.module];
    if(!view||!editor?.loadRecipe)return alert("Ten moduł nie ma jeszcze edytora mobilnego.");
    closeMenu();closePreview();AppState.beginEdit(page.id);if(editor.loadRecipe(page))router.show(view);
  }
  function openPreview(page){page=currentPage(page?.id)||page;if(!page)return;previewPage=page;previewTitle.textContent=page.title||"Strona";previewMeta.textContent=`${ModuleRegistry.displayName(page.module)} · seed ${page.seed??"—"}`;renderPagePreview(previewCanvas,page);if(!dialog.open)dialog.showModal()}
  function closePreview(){if(dialog?.open)dialog.close();previewPage=null}
  function closeMenu(){menu.hidden=true;menu.innerHTML=""}
  function runAction(action,page){closeMenu();if(action==="preview")openPreview(page);else if(action==="edit")openEditor(page);else if(action==="copy")CartManager.duplicate(page.id);else if(action==="up")CartManager.move(page.id,-1);else if(action==="down")CartManager.move(page.id,1);else if(action==="remove"&&confirm("Usunąć tę stronę?"))CartManager.remove(page.id)}
  function openMenu(page,x,y){page=currentPage(page?.id)||page;if(!page)return;longPressed=true;menu.innerHTML=`<strong>${esc(page.title||"Strona")}</strong><button data-action="preview">Pełny podgląd</button><button data-action="edit">Edytuj</button><button data-action="copy">Utwórz kopię</button><button data-action="up">Przesuń wyżej</button><button data-action="down">Przesuń niżej</button><button class="danger" data-action="remove">Usuń</button>`;menu.hidden=false;const width=Math.min(280,window.innerWidth-24),left=Math.max(12,Math.min(x-width/2,window.innerWidth-width-12)),top=Math.max(76,Math.min(y-20,window.innerHeight-menu.offsetHeight-20));menu.style.width=`${width}px`;menu.style.left=`${left}px`;menu.style.top=`${top}px`;menu.querySelectorAll("[data-action]").forEach(button=>button.onclick=()=>runAction(button.dataset.action,page))}

  document.querySelector("#closePagePreview").onclick=closePreview;
  document.querySelector("#editPreviewPage").onclick=()=>openEditor(previewPage);
  dialog.addEventListener("click",event=>{if(event.target===dialog)closePreview()});
  document.addEventListener("pointerdown",event=>{if(!menu.hidden&&!menu.contains(event.target))closeMenu()});

  function bindLongPress(button,page){let timer=null,startX=0,startY=0;const cancel=()=>{clearTimeout(timer);timer=null};button.addEventListener("pointerdown",event=>{if(event.pointerType==="mouse"&&event.button!==0)return;longPressed=false;startX=event.clientX;startY=event.clientY;timer=setTimeout(()=>{navigator.vibrate?.(35);openMenu(page,event.clientX,event.clientY)},550)});button.addEventListener("pointermove",event=>{if(Math.hypot(event.clientX-startX,event.clientY-startY)>12)cancel()});["pointerup","pointercancel","pointerleave"].forEach(type=>button.addEventListener(type,cancel));button.addEventListener("contextmenu",event=>{event.preventDefault();openMenu(page,event.clientX,event.clientY)});button.addEventListener("click",event=>{if(longPressed){event.preventDefault();event.stopPropagation();longPressed=false;return}openPreview(page)})}

  function render(){
    const project=ProjectManager.ensure(),pages=(project.pages||[]);
    document.querySelector("#cartProjectName").textContent=project.name;
    document.querySelector("#cartCount").textContent=`${pages.length} stron`;
    box.innerHTML=pages.length?`<div class="cart-grid">${pages.map((page,index)=>`<article class="page-card" data-page-card="${page.id}"><button class="page-preview" data-preview="${page.id}" aria-label="Otwórz podgląd strony ${index+1}"><span class="page-number">${index+1}</span><canvas data-thumb="${page.id}"></canvas></button><div class="page-info"><strong>${esc(page.title||"Strona")}</strong><small>${esc(ModuleRegistry.displayName(page.module))}</small><small>Przytrzymaj miniaturę, aby otworzyć menu</small></div><div class="page-actions"><button class="secondary" data-up="${page.id}">↑</button><button class="secondary" data-down="${page.id}">↓</button><button class="secondary" data-edit="${page.id}">Edytuj</button><button class="secondary" data-copy="${page.id}">Kopia</button><button class="danger page-action-wide" data-remove="${page.id}">Usuń</button></div></article>`).join("")}</div>`:"<p class='empty'>Koszyk jest pusty.</p>";
    pages.forEach(page=>{const canvas=box.querySelector(`[data-thumb="${page.id}"]`);renderPageThumbnail(canvas,page);bindLongPress(box.querySelector(`[data-preview="${page.id}"]`),page)});
    box.querySelectorAll("[data-edit]").forEach(button=>button.onclick=()=>openEditor(pages.find(page=>page.id===button.dataset.edit)));
    box.querySelectorAll("[data-up]").forEach(button=>button.onclick=()=>CartManager.move(button.dataset.up,-1));
    box.querySelectorAll("[data-down]").forEach(button=>button.onclick=()=>CartManager.move(button.dataset.down,1));
    box.querySelectorAll("[data-copy]").forEach(button=>button.onclick=()=>CartManager.duplicate(button.dataset.copy));
    box.querySelectorAll("[data-remove]").forEach(button=>button.onclick=()=>{if(confirm("Usunąć tę stronę?"))CartManager.remove(button.dataset.remove)});
    if(previewPage&&dialog.open){const fresh=pages.find(page=>page.id===previewPage.id);fresh?openPreview(fresh):closePreview()}
  }
  return{render,openEditor,openPreview};
}
