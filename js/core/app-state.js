import{EventBus,APP_EVENTS}from"./event-bus.js";

const state={view:"home",ready:false,editingPageId:null,busy:false,lastError:null};

export const AppState={
  get(key){return key?state[key]:structuredClone(state)},
  set(patch){Object.assign(state,patch);EventBus.emit("state:changed",this.get());return this.get()},
  setView(view){state.view=view;EventBus.emit(APP_EVENTS.VIEW_CHANGED,{view});return view},
  beginEdit(pageId){return this.set({editingPageId:pageId||null})},
  endEdit(){return this.set({editingPageId:null})},
  setBusy(busy){return this.set({busy:Boolean(busy)})},
  fail(error){console.error(error);return this.set({lastError:String(error?.message||error),busy:false})},
  markReady(){return this.set({ready:true,lastError:null})}
};
