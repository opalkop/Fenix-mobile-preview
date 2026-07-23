export const STORAGE_KEYS={projects:"fenix-mobile-projects-v1",activeProject:"fenix-mobile-active-project-v1",settings:"fenix-mobile-settings-v1"};

export const Storage={
  read(key,fallback){
    try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}
  },
  write(key,value){localStorage.setItem(key,JSON.stringify(value));return value},
  remove(key){localStorage.removeItem(key)}
};

export function uid(prefix="id"){
  return `${prefix}-${crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(16).slice(2)}`;
}