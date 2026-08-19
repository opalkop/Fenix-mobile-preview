"use strict";
(()=>{
  const importButton=document.getElementById('importProject'),exportButton=document.getElementById('exportProject'),fileInput=document.getElementById('projectFile'),status=document.getElementById('projectTransferStatus');
  if(!importButton||!exportButton||!fileInput)return;
  const setStatus=text=>{if(status)status.textContent=text};
  function pagesOf(payload){if(Array.isArray(payload?.pages))return payload.pages;if(Array.isArray(payload?.project?.pages))return payload.project.pages;return[]}
  function ensureContracts(){if(window.FenixModuleContracts)return Promise.resolve();return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='core/module-contracts.js?v=1';s.onload=resolve;s.onerror=()=>reject(new Error('Nie udało się załadować tabeli zgodności FPP/FPM.'));document.head.appendChild(s)})}
  function assertCompatibility(payload){if(!window.FenixModuleContracts)return;const unsupported=[];for(const page of pagesOf(payload)){const check=FenixModuleContracts.check(page);if(check.reason==='newer-module-version')unsupported.push(`${check.module} v${check.incomingVersion} > v${check.supportedVersion}`)}if(unsupported.length)throw new Error(`Projekt używa nowszej logiki Studio niż ta wersja FPM: ${unsupported.join(', ')}.`)}
  importButton.onclick=()=>fileInput.click();
  exportButton.onclick=()=>FenixCore.exportProject();
  fileInput.onchange=async()=>{
    const file=fileInput.files?.[0];if(!file)return;
    setStatus('Importuję projekt FENIX…');
    try{
      const payload=JSON.parse(await file.text());
      await ensureContracts();
      assertCompatibility(payload);
      const project=FenixCore.importProjectPayload(payload);
      setStatus(`Zaimportowano „${project.name}” · ${project.pages.length} stron · ${Object.keys(project.assets||{}).length} assetów.`);
    }catch(error){console.error(error);setStatus(error.message||'Import nie powiódł się.');alert(error.message||'Nie udało się zaimportować projektu.');}
    finally{fileInput.value=''}
  };
})();