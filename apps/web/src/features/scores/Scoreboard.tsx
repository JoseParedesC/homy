import{penaltiesOf,removePenalty,scoreOf,useDB}from"../../lib/store";import{Avatar,Btn,Card,Pts}from"../../ui";import{PenaltyForm}from"./PenaltyForm";
export function Scoreboard(){
 const d=useDB(),isAdmin=d.members.find(m=>m.id===d.me)?.role==="admin",name=(id:string)=>d.members.find(m=>m.id===id)?.name,task=(id?:string|null)=>d.tasks.find(t=>t.id===d.assignments.find(a=>a.id===id)?.taskId)?.name;
 const rows=d.members.filter(m=>m.active).map(m=>({m,s:scoreOf(d,m.id),pen:penaltiesOf(d,m.id)})).sort((a,b)=>b.s-a.s),max=Math.max(1,...rows.map(r=>Math.abs(r.s)));
 const log=[...d.assignments.flatMap(a=>a.notes.map(n=>({id:n.id,at:n.at,text:n.text,pts:n.delta,who:name(a.memberId),task:task(a.id),pid:""}))),
  ...d.penalties.map(p=>({id:p.id,at:p.createdAt,text:p.reason,pts:p.points,who:name(p.memberId),task:task(p.assignmentId),pid:p.id}))].sort((x,y)=>y.at.localeCompare(x.at)).slice(0,12);
 return<div className="space-y-5">{isAdmin&&<PenaltyForm/>}<div className="grid gap-5 lg:grid-cols-2"><Card className="space-y-5 p-5"><h2 className="text-lg">Puntajes</h2>
  {rows.map(({m,s,pen},i)=><div key={m.id} className="space-y-2"><div className="flex items-center gap-3"><span className="w-5 font-display text-slate">{i+1}</span><Avatar name={m.name}/><span className="flex-1 font-medium">{m.name}{pen<0&&<span className="ml-2 text-xs text-clay">{pen} por penalizaciones</span>}</span><Pts n={s}/></div>
   <div className="h-2 overflow-hidden rounded-full bg-mist"><div className={`h-full rounded-full transition-[width] duration-700 ease-out ${s<0?"bg-clay":"bg-moss"}`} style={{width:`${(Math.abs(s)/max)*100}%`}}/></div></div>)}</Card>
  <Card className="space-y-3 p-5"><h2 className="text-lg">Anotaciones y penalizaciones</h2>
   {log.map(n=><div key={n.id} className="flex items-start justify-between gap-3 border-b border-line pb-2 text-sm last:border-0"><span>{n.text}<span className="block text-xs text-slate">{n.who}{n.task?` · ${n.task}`:""}{n.pid?" · penalización":""}</span></span>
    <span className="flex items-center gap-2"><Pts n={n.pts}/>{isAdmin&&n.pid&&<Btn tone="ghost" className="!px-2 !py-1 text-xs" onClick={()=>removePenalty(n.pid)} aria-label="Quitar penalización">Quitar</Btn>}</span></div>)}
   {!log.length&&<p className="text-sm text-slate">Aún no hay anotaciones.</p>}</Card></div></div>}
