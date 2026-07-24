const listeners=new Map();

export const EventBus={
  on(event,handler){
    if(!listeners.has(event))listeners.set(event,new Set());
    listeners.get(event).add(handler);
    return()=>this.off(event,handler);
  },
  off(event,handler){listeners.get(event)?.delete(handler)},
  emit(event,payload){
    listeners.get(event)?.forEach(handler=>{
      try{handler(payload)}catch(error){console.error(`[EventBus:${event}]`,error)}
    });
  },
  clear(event){event?listeners.delete(event):listeners.clear()}
};

export const APP_EVENTS={
  PROJECT_CREATED:"project:created",
  PROJECT_UPDATED:"project:updated",
  PROJECT_DELETED:"project:deleted",
  PROJECT_ACTIVATED:"project:activated",
  CART_CHANGED:"cart:changed",
  SETTINGS_CHANGED:"settings:changed",
  VIEW_CHANGED:"view:changed",
  IMPORT_COMPLETED:"import:completed"
};
