const vm=require("vm"),fs=require("fs"),assert=require("assert");
const src=fs.readFileSync(require("path").join(__dirname,"..","core","sync-core.js"),"utf8");
function env(remoteBundle){
  const store=new Map(),puts=[];
  const projects=[{id:"p1",name:"Local",updatedAt:"2026-01-01T00:00:00Z",pages:[{img:"data:image/png;base64,AAA"}]}];
  const b64=s=>Buffer.from(s,"utf8").toString("base64");
  const fetch=async(url,opt={})=>{
    if((opt.method||"GET")==="PUT"){puts.push(JSON.parse(opt.body));return{status:200,ok:true,json:async()=>({commit:{sha:"x"}})}}
    if(!remoteBundle)return{status:404,ok:false,json:async()=>({})};
    return{status:200,ok:true,json:async()=>({sha:"s1",content:b64(JSON.stringify(remoteBundle))})};
  };
  const ls={getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  const FenixCore={getProjects:()=>projects,getActiveProjectId:()=>"p1",createProject:p=>projects.push(p),updateProject:(id,p)=>Object.assign(projects.find(x=>x.id===id),p),setActiveProject:()=>{}};
  const sb={window:{},localStorage:ls,sessionStorage:ls,fetch,FenixCore,TextEncoder,TextDecoder,atob:s=>Buffer.from(s,"base64").toString("binary"),btoa:s=>Buffer.from(s,"binary").toString("base64"),setTimeout,console,URL,encodeURIComponent,Blob:class{},document:{addEventListener(){}},navigator:{onLine:true}};
  sb.window=sb;vm.createContext(sb);vm.runInContext(src,sb);
  ls.setItem("fenix-sync-config-v1",JSON.stringify({token:"t"}));
  return{sync:sb.FenixSync,puts,projects};
}
const desktopManifest={type:"FENIX_SYNC_BUNDLE",version:6,projects:[{id:"p1",name:"Desk",updatedAt:"2027-01-01T00:00:00Z",pages:[{img:""}]}],assetChunks:[{path:"c/1.json"}],payloadCount:1};
const oldBundle={type:"FENIX_SYNC_BUNDLE",version:2,projects:[{id:"p2",name:"Other",updatedAt:"2026-02-01T00:00:00Z",pages:[]}]};
(async()=>{
  let e=env(desktopManifest);
  assert.throws(()=>e.sync.mergeBundle(desktopManifest),/nowsza wersja/);
  assert.equal(e.projects[0].pages[0].img,"data:image/png;base64,AAA","lokalne obrazy nienaruszone");
  await assert.rejects(e.sync.push(),/nowsza wersja/);
  assert.equal(e.puts.length,0,"brak nadpisania danych desktopu");
  e=env(oldBundle);
  const st=e.sync.mergeBundle(oldBundle);assert.equal(st.created,1);
  await e.sync.push();assert.equal(e.puts.length,1,"zapis do starego formatu nadal działa");
  e=env(null);await e.sync.push();assert.equal(e.puts.length,1,"pierwszy zapis działa");
  console.log("PASS sync-guard: nowszy format odrzucony przy pull i push, stary format działa");
})().catch(err=>{console.error(err);process.exit(1)});
