import{ProjectManager}from"../core/projects.js";
import{getKdpProfile,kdpMetrics,gutterInches}from"../core/kdp-profile.js";

function ensureStyles(){
  if(document.querySelector('link[data-settings-redesign]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='css/settings-redesign.css?v=0.10.3-alpha13';
  link.dataset.settingsRedesign='true';
  document.head.appendChild(link);
}

function metric(label,value,accent=false){return `<div class="settings-metric${accent?' accent':''}"><small>${label}</small><strong>${value}</strong></div>`}

function renderPreview(){
  const box=document.querySelector('#settingsLivePreview');
  if(!box)return;
  const p={...getKdpProfile(),format:document.querySelector('#defaultFormat')?.value||'8.5x11',language:document.querySelector('#defaultLanguage')?.value||'en',bleed:document.querySelector('#kdpBleed')?.value||'none',pageCount:Number(document.querySelector('#kdpPageCount')?.value||120),pageSide:document.querySelector('#kdpPageSide')?.value||'auto'};
  const m=kdpMetrics(p);
  box.innerHTML=`${metric('Format',m.format.label,true)}${metric('Spady',p.bleed==='bleed'?'Tak':'Nie')}${metric('Strony',p.pageCount)}${metric('Margines wewn.',`${gutterInches(p.pageCount)}″`)}${metric('Produkcja',`${m.productionWidthPx} × ${m.productionHeightPx} px`)}${metric('Język',p.language==='pl'?'Polski':'Angielski')}`;
}

function enhanceSettings(){
  const view=document.querySelector('#view-settings');
  if(!view||view.dataset.enhanced)return;
  view.dataset.enhanced='true';
  const card=view.querySelector('.card');
  const grid=card?.querySelector('.field-grid');
  const summary=document.querySelector('#kdpProfileSummary');
  const save=document.querySelector('#saveSettings');
  const status=document.querySelector('#settingsStatus');
  if(!card||!grid||!summary||!save||!status)return;
  card.classList.add('settings-card');
  card.insertAdjacentHTML('afterbegin',`<div class="settings-head"><div><p class="eyebrow">Profil produkcyjny</p><h2>Ustawienia KDP</h2><p class="muted">Ustal parametry raz. Wszystkie nowe strony będą projektowane według tego profilu.</p></div><div class="settings-shield">KDP<br><strong>300 DPI</strong></div></div><div class="settings-steps"><span class="active">1. Format</span><span>2. Marginesy</span><span>3. Eksport</span></div>`);
  const oldEyebrow=Array.from(card.children).find(x=>x.matches?.('.eyebrow'));
  const oldH2=Array.from(card.children).find(x=>x.tagName==='H2');
  oldEyebrow?.remove();oldH2?.remove();
  grid.insertAdjacentHTML('beforebegin','<div class="settings-section-title"><span>01</span><div><strong>Parametry książki</strong><small>Format, język i układ produkcyjny</small></div></div>');
  summary.insertAdjacentHTML('beforebegin','<div class="settings-section-title"><span>02</span><div><strong>Podsumowanie produkcyjne</strong><small>Aktualizowane na żywo</small></div></div><div id="settingsLivePreview" class="settings-live-preview"></div>');
  summary.classList.add('settings-summary-note');
  const actions=document.createElement('div');actions.className='settings-save-area';save.parentNode.insertBefore(actions,save);actions.append(save,status);save.textContent='Zapisz profil produkcyjny';
  ["defaultFormat","defaultLanguage","kdpBleed","kdpPageCount","kdpPageSide"].forEach(id=>document.querySelector(`#${id}`)?.addEventListener('input',renderPreview));
  renderPreview();
}

function enhanceExport(){
  const card=document.querySelector('.cart-export-card');
  if(!card||card.dataset.enhanced)return;
  card.dataset.enhanced='true';
  const project=ProjectManager.ensure();
  card.insertAdjacentHTML('afterbegin',`<div class="export-route"><div class="export-node done"><span>1</span><small>Projekt</small></div><i></i><div class="export-node done"><span>2</span><small>Koszyk</small></div><i></i><div class="export-node"><span>3</span><small>FENIX PC</small></div></div><div class="export-file-card"><span class="export-file-icon">F</span><div><strong>${project.name}</strong><small>Plik .fenixmobile · receptury i stan edycji</small></div><span class="export-ready">Gotowy</span></div>`);
}

export function initSettingsUi(){ensureStyles();enhanceSettings();enhanceExport()}
