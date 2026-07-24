import{ProjectManager}from"../core/projects.js";
import{CartManager}from"../core/cart.js";
import{TransferManager}from"../core/transfer.js";
import{AppState}from"../core/app-state.js";
import{EventBus,APP_EVENTS}from"../core/event-bus.js";
import{getKdpProfile,saveKdpProfile,gutterInches,kdpMetrics}from"../core/kdp-profile.js";

export function initSettingsAndTransfer({router}){
  const format=document.querySelector("#defaultFormat"),language=document.querySelector("#defaultLanguage"),bleed=document.querySelector("#kdpBleed"),pageCount=document.querySelector("#kdpPageCount"),pageSide=document.querySelector("#kdpPageSide"),status=document.querySelector("#settingsStatus"),summary=document.querySelector("#kdpProfileSummary");
  function load(){const p=getKdpProfile();format.value=p.format;language.value=p.language;bleed.value=p.bleed;pageCount.value=p.pageCount;pageSide.value=p.pageSide;renderSummary(p)}
  function renderSummary(p=getKdpProfile()){const m=kdpMetrics(p);summary.textContent=`KDP: ${m.format.label} · ${p.bleed==="bleed"?"ze spadami":"bez spadów"} · ${p.pageCount} stron · margines wewnętrzny min. ${gutterInches(p.pageCount)}\" · produkcja ${m.productionWidthPx} × ${m.productionHeightPx} px / 300 DPI.`}
  load();
  document.querySelector("#saveSettings").onclick=()=>{const value=saveKdpProfile({format:format.value,language:language.value,bleed:bleed.value,pageCount:Number(pageCount.value),pageSide:pageSide.value});EventBus.emit(APP_EVENTS.SETTINGS_CHANGED,value);status.textContent="Profil produkcyjny KDP zapisany";renderSummary(value)};
  [format,bleed,pageCount,pageSide].forEach(x=>x.oninput=()=>renderSummary({...getKdpProfile(),format:format.value,bleed:bleed.value,pageCount:Number(pageCount.value),pageSide:pageSide.value}));
  const fileInput=document.querySelector("#importProjectFile");
  document.querySelector("#exportProject").onclick=()=>{const project=ProjectManager.ensure();if(!(project.pages||[]).length)return alert("Koszyk jest pusty.");TransferManager.export(project)};
  document.querySelector("#importProject").onclick=()=>fileInput.click();
  fileInput.onchange=async()=>{const file=fileInput.files?.[0];if(!file)return;try{AppState.setBusy(true);await TransferManager.importFile(file);alert("Projekt zaimportowany.");router.show("home")}catch(error){AppState.fail(error);alert(error.message||"Nie udało się zaimportować projektu.")}finally{AppState.setBusy(false);fileInput.value=""}};
  document.querySelector("#clearCart").onclick=()=>{if(confirm("Wyczyścić cały Koszyk Feniksa?"))CartManager.clear()};
}
