import type{DB}from"../../lib/store";import{entries,summary,type Period}from"../../lib/period";import{Avatar,Card,Pts}from"../../ui";
const KIND={tarea:"Tarea",nota:"Nota",penalizacion:"Penalización"};
export function RankingView({d,p}:{d:DB;p:Period}){
 const rows=summary(d,p).sort((a,b)=>b.neto-a.neto),max=Math.max(1,...rows.map(r=>Math.abs(r.neto))),nm=(id:string)=>d.members.find(m=>m.id===id)?.name,recent=entries(d,p).slice(0,8);
 return<div className="grid gap-5 lg:grid-cols-2"><Card className="space-y-5 p-5"><h2 className="text-lg">Ranking</h2>
  {rows.map((r,i)=><div key={r.memberId} className="space-y-2"><div className="flex items-center gap-3"><span className="w-5 font-display text-slate">{i+1}</span><Avatar name={nm(r.memberId)??"?"}/>
   <span className="flex-1 font-medium">{nm(r.memberId)}{r.restado<0&&<span className="ml-2 rounded-full bg-clay-light px-2 py-0.5 text-xs text-clay">{r.restado} restados</span>}</span><Pts n={r.neto}/></div>
   <div className="h-2 overflow-hidden rounded-full bg-mist"><div className={`h-full rounded-full transition-[width] duration-700 ease-out ${r.neto<0?"bg-clay":"bg-moss"}`} style={{width:`${(Math.abs(r.neto)/max)*100}%`}}/></div></div>)}
  {!rows.length&&<p className="text-sm text-slate">Sin integrantes.</p>}</Card>
  <Card className="space-y-3 p-5"><h2 className="text-lg">Movimientos recientes</h2>
   {recent.map(e=><div key={e.id} className="flex items-start justify-between gap-3 border-b border-line pb-2 text-sm last:border-0"><span>{e.text}<span className="block text-xs text-slate">{nm(e.memberId)} · {KIND[e.kind]}{e.task&&e.kind!=="tarea"?` · ${e.task}`:""}</span></span><Pts n={e.pts}/></div>)}
   {!recent.length&&<p className="text-sm text-slate">Sin movimientos en este periodo.</p>}</Card></div>}
