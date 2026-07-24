export const esc=value=>String(value??"").replace(/[&<>\"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));

export function formatDate(value){
  try{return new Intl.DateTimeFormat("pl-PL",{dateStyle:"medium"}).format(new Date(value))}
  catch{return"—"}
}

export function progressOf(project){
  const count=(project.pages||[]).length;
  const goal=Math.max(1,Number(project.goal)||120);
  return{count,goal,percent:Math.min(100,Math.round(count/goal*100))};
}
