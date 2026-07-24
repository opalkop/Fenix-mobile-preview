import{ProjectManager}from"../core/projects.js";
import{CartManager}from"../core/cart.js";
import{AppState}from"../core/app-state.js";
import{ModuleRegistry}from"../core/module-registry.js";
import{renderPageThumbnail,renderPagePreview}from"../core/thumbnails.js";
import{esc}from"../ui/helpers.js";

export function createCartController({router,editors}){
  const box=document.querySelector("#cartList"),dialog=document.querySelector("#pagePreviewDialog"),previewCanvas=document.querySelector("#pagePreviewCanvas"),previewTitle=document.querySelector("#pagePreviewTitle"),previewMeta=document.querySelector("#pagePreviewMeta");
  let previewPage=null;

  function openEditor(page){
    if(!page)return;
    const view=ModuleRegistry.editorView(page),editor=editors[page.module];
    if(!view||!editor?.loadRecipe)return alert("Ten moduł nie ma jeszcze edytora mobilnego.");
    closePreview();AppState.beginEdit(page.id);if(editor.loadRecipe(page))router.show(view);
  }
  function openPreview(page){if(!page)return;previewPage=page;previewTitle.textContent=page.title||"Strona";previewMeta.textContent=`${ModuleRegistry.displayName(page.module)} · seed ${page.seed??"—"}`;renderPagePreview(previewCanvas,page);dialog.showModal()}
  function closePreview(){if(dialog?.open)dialog.close();previewPage=null}
  document.querySelector("#closePagePreview").onclick=closePreview;
  document.querySelector("#editPreviewPage").onclick=()=>openEditor(previewPage);
  dialog.addEventListener("click",event=>{if(event.target===dialog)closePreview()});

  function render(){
    const project=ProjectManager.ensure(),pages=project.pages||[];
    document.querySelector("#cartProjectName").textContent=project.name;
    document.querySelector("#cartCount").textContent=`${pages.length} stron`;
    box.innerHTML=pages.length?`<div class="cart-grid">${pages.map((page,index)=>`<article class="page-card"><button class="page-preview" data-preview="${page.id}" aria-label="Otwórz podgląd strony ${index+1}"><span class="page-number">${index+1}</span><canvas data-thumb="${page.id}"></canvas></button><div class="page-info"><strong>${esc(page.title||"Strona")}</strong><small>${esc(ModuleRegistry.displayName(page.module))}</small></div><div class="page-actions"><button class="secondary" data-up="${page.id}">↑</button><button class="secondary" data-down="${page.id}">↓</button><button class="secondary" data-edit="${page.id}">Edytuj</button><button class="secondary" data-copy="${page.id}">Kopia</button><button class="danger page-action-wide" data-remove="${page.id}">Usuń</button></div></article>`).join("")}</div>`:"<p class='empty'>Koszyk jest pusty.</p>";
    pages.forEach(page=>renderPageThumbnail(box.querySelector(`[data-thumb="${page.id}"]`),page));
    box.querySelectorAll("[data-preview]").forEach(button=>button.onclick=()=>openPreview(pages.find(page=>page.id===button.dataset.preview)));
    box.querySelectorAll("[data-edit]").forEach(button=>button.onclick=()=>openEditor(pages.find(page=>page.id===button.dataset.edit)));
    box.querySelectorAll("[data-up]").forEach(button=>button.onclick=()=>CartManager.move(button.dataset.up,-1));
    box.querySelectorAll("[data-down]").forEach(button=>button.onclick=()=>CartManager.move(button.dataset.down,1));
    box.querySelectorAll("[data-copy]").forEach(button=>button.onclick=()=>CartManager.duplicate(button.dataset.copy));
    box.querySelectorAll("[data-remove]").forEach(button=>button.onclick=()=>{if(confirm("Usunąć tę stronę?"))CartManager.remove(button.dataset.remove)});
  }
  return{render,openEditor,openPreview};
}
