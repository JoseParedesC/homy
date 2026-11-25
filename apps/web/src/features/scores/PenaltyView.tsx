import{useState}from"react";import type{DB}from"../../lib/store";import{isClosed,removePenalty}from"../../lib/store";import{day,dayLabel,entries,summary,type Entry,type Period}from"../../lib/period";import{Avatar,Btn,Card,Pts,Stat}from"../../ui";
export function PenaltyView({d,p,admin}:{d:DB;p:Period;admin:boolean}){
 const[who,setWho]=useState(""),nm=(id:string)=>d.members.find(m=>m.id===id)?.name??"?";
 const all=entries(d,p).filter(e=>e.pts<0),list=who?all.filter(e=>e.memberId===who):all,total=list.reduce((s,e)=>s+e.pts,0);
 const rows=summary(d,p).filter(r=>r.restado<0).sort((a,b)=>a.restado-b.restado),max=Math.abs(rows[0]?.restado??1);
 const groups=Object.entries(list.reduce<Record<string,Entry[]>>((g,e)=>{(g[day(e.at)]??=[]).push(e);return g},{})).sort((a,b)=>b[0].localeCompare(a[0]));
 return<div className="space-y-5"><div className="grid gap-4 sm:grid-cols-3"><Stat label="Puntos restados" value={total} tone={total<0?"clay":"ink"}/><Stat label="Penalizaciones y notas negativas" value={list.length}/><Stat label="Más penalizado" value={rows[0]?nm(rows[0].memberId):"—"}/></div>
  <div className="flex flex-wrap gap-2"><Chip on={!who} onClick={()=>setWho("")}>Todos</Chip>{rows.map(r=><Chip key={r.memberId} on={who===r.memberId} onClick={()=>setWho(r.memberId)}>{nm(r.memberId)} · {r.restado}</Chip>)}</div>
  <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]"><Card className="space-y-4 p-5"><h2 className="text-lg">Por integrante</h2>
   {rows.map(r=><div key={r.memberId} className="space-y-1.5"><div className="flex items-center gap-2 text-sm"><Avatar name={nm(r.memberId)}/><span className="flex-1">{nm(r.memberId)}<span className="block text-xs text-slate">{r.nPens} en el periodo</span></span><Pts n={r.restado}/></div>
    <div className="h-2 overflow-hidden rounded-full bg-mist"><div className="h-full rounded-full bg-clay transition-[width] duration-700 ease-out" style={{width:`${(Math.abs(r.restado)/max)*100}%`}}/></div></div>)}
   {!rows.length&&<p className="text-sm text-slate">Nadie fue penalizado en este periodo.</p>}</Card>
   <Card className="space-y-5 p-5"><h2 className="text-lg">Detalle por día</h2>
    {groups.map(([g,es])=><div key={g} className="space-y-2"><div className="flex justify-between text-xs font-medium uppercase tracking-wide text-slate"><span>{dayLabel(g)}</span><span>{es.reduce((s,e)=>s+e.pts,0)} pts</span></div>
     {es.map(e=><div key={e.id} className="rise flex items-start justify-between gap-3 rounded-xl bg-clay-light/60 px-3 py-2 text-sm"><span>{e.text}<span className="block text-xs text-slate">{nm(e.memberId)} · {e.kind==="nota"?"Nota":"Penalización"}{e.task?` · ${e.task}`:""}{e.by?` · ${e.by}`:""}</span></span>
      <span className="flex items-center gap-2"><Pts n={e.pts}/>{admin&&e.penaltyId&&!isClosed(d,e.at)&&<Btn tone="ghost" className="!px-2 !py-1 text-xs" onClick={()=>removePenalty(e.penaltyId!)}>Quitar</Btn>}</span></div>)}</div>)}
    {!groups.length&&<p className="text-sm text-slate">Sin penalizaciones para mostrar.</p>}</Card></div></div>}
const Chip=({on,...p}:{on:boolean}&React.ButtonHTMLAttributes<HTMLButtonElement>)=><button {...p} className={`rounded-full border px-3 py-1 text-sm transition ${on?"border-moss bg-moss-light text-moss":"border-line bg-surface text-slate hover:border-moss"}`}/>;
