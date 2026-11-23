import{scoreOf,useDB}from"../../lib/store";import{Avatar,Card,Pts}from"../../ui";
export function Scoreboard(){
 const d=useDB(),rows=d.members.filter(m=>m.active).map(m=>({m,s:scoreOf(d,m.id)})).sort((a,b)=>b.s-a.s),max=Math.max(1,...rows.map(r=>Math.abs(r.s)));
 const log=d.assignments.flatMap(a=>a.notes.map(n=>({...n,who:d.members.find(m=>m.id===a.memberId)?.name,task:d.tasks.find(t=>t.id===a.taskId)?.name}))).sort((x,y)=>y.at.localeCompare(x.at)).slice(0,10);
 return<div className="grid gap-5 lg:grid-cols-2"><Card className="space-y-5 p-5"><h2 className="text-lg">Puntajes</h2>
  {rows.map(({m,s},i)=><div key={m.id} className="space-y-2"><div className="flex items-center gap-3"><span className="w-5 font-display text-slate">{i+1}</span><Avatar name={m.name}/><span className="flex-1 font-medium">{m.name}</span><Pts n={s}/></div>
   <div className="h-2 overflow-hidden rounded-full bg-mist"><div className={`h-full rounded-full transition-[width] duration-700 ease-out ${s<0?"bg-clay":"bg-moss"}`} style={{width:`${(Math.abs(s)/max)*100}%`}}/></div></div>)}</Card>
  <Card className="space-y-3 p-5"><h2 className="text-lg">Últimas anotaciones</h2>
   {log.map(n=><div key={n.id} className="flex justify-between gap-3 border-b border-line pb-2 text-sm last:border-0"><span>{n.text}<span className="block text-xs text-slate">{n.who} · {n.task}</span></span><Pts n={n.delta}/></div>)}
   {!log.length&&<p className="text-sm text-slate">Aún no hay anotaciones.</p>}</Card></div>}
