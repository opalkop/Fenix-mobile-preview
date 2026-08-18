"use strict";
(async()=>{
  if(!window.FenixCore||!window.FenixPageSchema||!window.FenixColoring)return;
  const id=new URLSearchParams(location.search).get("id");
  if(!id)return;
  const raw=FenixCore.getCart().find(x=>String(x.id)===String(id));
  if(!raw||FenixPageSchema.moduleOf(raw)!=="coloring-studio")return;
  const page=FenixPageSchema.normalize(raw),settings=page.recipe.settings||{},content=page.recipe.content||{};
  const byId=id=>document.getElementById(id);
  const set=(id,value)=>{const el=byId(id);if(el&&value!=null)el.value=value};
  set("title",page.title||"Color the Picture!");
  set("instructions",settings.instructions||"Use crayons or pencils to color the picture.");
  if(byId("showTitle"))byId("showTitle").checked=settings.showTitle!==false;
  if(byId("showInstructions"))byId("showInstructions").checked=settings.showInstructions!==false;
  ["titleSize","instructionSize","titleY","assetScale","assetY"].forEach(k=>set(k,settings[k]));

  const assetRef=content.assetRef||settings.assetRef||null;
  if(assetRef){
    const assets=FenixCore.listAssets().sort((a,b)=>{const ac=(a.tags||[]).includes("content")?0:1,bc=(b.tags||[]).includes("content")?0:1;return ac-bc||String(a.name).localeCompare(String(b.name),"pl")});
    const index=assets.findIndex(a=>a.id===assetRef);
    const cards=[...document.querySelectorAll("#assetGrid .asset-card")];
    if(index>=0&&cards[index]&&!cards[index].classList.contains("selected"))cards[index].click();
  }

  const cart=byId("cart");
  if(cart){
    cart.textContent="Zapisz zmiany w Stronach projektu";
    cart.onclick=()=>{
      const current=FenixPageSchema.normalize(raw),s=current.recipe.settings||{};
      const nextSettings={...s,title:byId("title")?.value||page.title,instructions:byId("instructions")?.value||"",showTitle:Boolean(byId("showTitle")?.checked),showInstructions:Boolean(byId("showInstructions")?.checked),titleSize:Number(byId("titleSize")?.value)||112,instructionSize:Number(byId("instructionSize")?.value)||46,titleY:Number(byId("titleY")?.value)||230,assetScale:Number(byId("assetScale")?.value)||82,assetY:Number(byId("assetY")?.value)||56};
      const updated={...current,title:nextSettings.title,recipe:{...current.recipe,title:nextSettings.title,settings:nextSettings,content:{...current.recipe.content,assetRef}},updatedAt:new Date().toISOString()};
      FenixCore.updatePage(current.id,updated);
      const status=byId("status");if(status)status.textContent="Zapisano zmiany w stronie Coloring Studio.";
      cart.textContent="Zapisano ✓";
      setTimeout(()=>cart.textContent="Zapisz zmiany w Stronach projektu",1200);
    };
  }
})();
