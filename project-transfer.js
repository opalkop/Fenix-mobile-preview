"use strict";
(()=>{
  const importButton=document.getElementById('importProject'),exportButton=document.getElementById('exportProject'),fileInput=document.getElementById('projectFile'),status=document.getElementById('projectTransferStatus');
  if(!importButton||!exportButton||!fileInput)return;
  const setStatus=text=>{if(status)status.textContent=text};
  importButton.onclick=()=>fileInput.click();
  exportButton.onclick=()=>FenixCore.exportProject();
  fileInput.onchange=async()=>{
    const file=fileInput.files?.[0];if(!file)return;
    setStatus('Importuję projekt FENIX…');
    try{
      const payload=JSON.parse(await file.text());
      const project=FenixCore.importProjectPayload(payload);
      setStatus(`Zaimportowano „${project.name}” · ${project.pages.length} stron · ${Object.keys(project.assets||{}).length} assetów.`);
    }catch(error){console.error(error);setStatus(error.message||'Import nie powiódł się.');alert(error.message||'Nie udało się zaimportować projektu.');}
    finally{fileInput.value=''}
  };
})();
