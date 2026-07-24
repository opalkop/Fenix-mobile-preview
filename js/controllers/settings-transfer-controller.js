import{ProjectManager}from"../core/projects.js";
import{CartManager}from"../core/cart.js";
import{Storage,STORAGE_KEYS}from"../core/storage.js";
import{TransferManager}from"../core/transfer.js";
import{AppState}from"../core/app-state.js";
import{EventBus,APP_EVENTS}from"../core/event-bus.js";

export function initSettingsAndTransfer({router}){
  const settings=Storage.read(STORAGE_KEYS.settings,{format:"8.5x11",language:"en"});
  const format=document.querySelector("#defaultFormat");
  const language=document.querySelector("#defaultLanguage");
  const status=document.querySelector("#settingsStatus");
  format.value=settings.format;
  language.value=settings.language;

  document.querySelector("#saveSettings").onclick=()=>{
    const value={format:format.value,language:language.value};
    Storage.write(STORAGE_KEYS.settings,value);
    EventBus.emit(APP_EVENTS.SETTINGS_CHANGED,value);
    status.textContent="Ustawienia zapisane";
  };

  const fileInput=document.querySelector("#importProjectFile");
  document.querySelector("#exportProject").onclick=()=>{
    const project=ProjectManager.ensure();
    if(!(project.pages||[]).length)return alert("Koszyk jest pusty.");
    TransferManager.export(project);
  };
  document.querySelector("#importProject").onclick=()=>fileInput.click();
  fileInput.onchange=async()=>{
    const file=fileInput.files?.[0];
    if(!file)return;
    try{
      AppState.setBusy(true);
      await TransferManager.importFile(file);
      alert("Projekt zaimportowany.");
      router.show("home");
    }catch(error){
      AppState.fail(error);
      alert(error.message||"Nie udało się zaimportować projektu.");
    }finally{
      AppState.setBusy(false);
      fileInput.value="";
    }
  };
  document.querySelector("#clearCart").onclick=()=>{if(confirm("Wyczyścić cały Koszyk Feniksa?"))CartManager.clear()};
}
