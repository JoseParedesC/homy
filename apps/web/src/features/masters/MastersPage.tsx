import{useMemo,useState}from"react";import{MasterCrud}from"@joseparedesc/master-crud";
import{memberAdapter,memberConfig,taskAdapter,taskConfig}from"./configs";
export function MastersPage({uid}:{uid:string}){
 const[sub,setSub]=useState<"tasks"|"members">("tasks");const user=useMemo(()=>({uid}),[uid]);
 return<div className="space-y-4"><div className="inline-flex rounded-xl bg-mist p-1 text-sm">
  {(["tasks","members"] as const).map(k=><button key={k} onClick={()=>setSub(k)} className={`rounded-lg px-4 py-1.5 transition ${sub===k?"bg-surface shadow-soft":"text-slate"}`}>{k==="tasks"?"Tareas":"Integrantes"}</button>)}</div>
  <div key={sub} className="rise">{sub==="tasks"?<MasterCrud adapter={taskAdapter} config={taskConfig} currentUser={user}/>:<MasterCrud adapter={memberAdapter} config={memberConfig} currentUser={user}/>}</div></div>}
