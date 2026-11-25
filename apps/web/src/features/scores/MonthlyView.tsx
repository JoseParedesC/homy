import{useState}from"react";import{closeMonth,monthKey,reopenMonth,type DB}from"../../lib/store";import{day,entries,summary,type Period}from"../../lib/period";import{Avatar,Btn,Card,Pts,Stat}from"../../ui";
export function MonthlyView({d,p,title,admin}:{d:DB;p:Period;title:string;admin:boolean}){
 const month=p.from.slice(0,7),close=d.closes.find(c=>c.month===month),future=month>monthKey(new Date()),[ask,setAsk]=useState(false),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
 const nm=(id:string)=>d.members.find(m=>m.id===id)?.name??"?",live=summary(d,p).map(r=>({...r,name:nm(r.memberId)}));
 // Mes cerrado: se muestra la foto guardada al cierre, no los datos en vivo.
 const rows=(close?close.snapshot.rows:live).slice().sort((a,b)=>b.neto-a.neto),es=close?close.snapshot.entries:entries(d,p);
 const sum=(k:"tareas"|"bonos"|"notasNeg"|"pens"|"neto")=>rows.reduce((s,r)=>s+r[k],0);
 const byDay=Array<number>(Number(p.to.slice(8))).fill(0);es.filter(e=>e.pts<0).forEach(e=>{byDay[Number(day(e.at).slice(8))-1]+=e.pts});const worst=Math.max(1,...byDay.map(Math.abs));
 const act=async(f:()=>Promise<unknown>)=>{setBusy(true);setErr("");try{await f();setAsk(false)}catch(e){setErr((e as Error).message)}setBusy(false)};
 const csv=()=>{const h="Integrante,Tareas,Bonos,Notas negativas,Penalizaciones,Neto\n",b=rows.map(r=>[r.name,r.tareas,r.bonos,r.notasNeg,r.pens,r.neto].join(",")).join("\n");
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob(["\ufeff"+h+b],{type:"text/csv"}));a.download=`homy-${month}${close?"-cerrado":""}.csv`;a.click();URL.revokeObjectURL(a.href)};
 return<div className="space-y-5">
  {close?<Card className="rise flex flex-wrap items-center justify-between gap-3 border-moss bg-moss-light/50 p-4 text-sm"><span><b>Mes cerrado</b> el {new Date(close.closedAt).toLocaleDateString("es-CO")} por {close.closedBy}. Sus movimientos están congelados y estas cifras son las del cierre.</span>
    {admin&&(ask?<span className="flex items-center gap-2">¿Reabrir?<Btn tone="clay" disabled={busy} onClick={()=>act(()=>reopenMonth(month))}>Sí, reabrir</Btn><Btn tone="ghost" onClick={()=>setAsk(false)}>Cancelar</Btn></span>:<Btn tone="ghost" onClick={()=>setAsk(true)}>Reabrir mes</Btn>)}</Card>
  :admin&&<Card className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><span className="text-slate">{future?"Este mes aún no empieza; no se puede cerrar.":"Mes abierto. Al cerrarlo se bloquean notas, penalizaciones y cambios de tareas de este mes."}</span>
    {!future&&(ask?<span className="flex items-center gap-2">¿Cerrar {title}?<Btn disabled={busy} onClick={()=>act(()=>closeMonth(month,{rows:live,entries:es}))}>Sí, cerrar</Btn><Btn tone="ghost" onClick={()=>setAsk(false)}>Cancelar</Btn></span>:<Btn onClick={()=>setAsk(true)}>Cerrar mes</Btn>)}</Card>}
  {err&&<p role="alert" className="text-sm text-clay">{err}</p>}
  <div className="grid gap-4 sm:grid-cols-3"><Stat label="Puntos ganados" value={`+${sum("tareas")+sum("bonos")}`} tone="moss"/><Stat label="Puntos restados" value={sum("notasNeg")+sum("pens")} tone="clay"/><Stat label="Neto del mes" value={sum("neto")}/></div>
  <Card className="p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg capitalize">Consolidado · {title}</h2><Btn tone="ghost" onClick={csv}>Exportar CSV</Btn></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[34rem] text-sm"><thead><tr className="border-b border-line text-left text-xs text-slate"><th className="pb-2 font-medium">Integrante</th>{["Tareas","Bonos","Notas −","Penalizaciones","Neto"].map(h=><th key={h} className="pb-2 text-right font-medium">{h}</th>)}</tr></thead>
    <tbody>{rows.map(r=><tr key={r.memberId} className="border-b border-line last:border-0"><td className="py-2.5"><span className="flex items-center gap-2"><Avatar name={r.name}/>{r.name}</span></td>
     {[r.tareas,r.bonos,r.notasNeg,r.pens].map((v,i)=><td key={i} className={`text-right tabular-nums ${v<0?"text-clay":v>0?"text-moss":"text-slate"}`}>{v>0?`+${v}`:v}</td>)}<td className="text-right"><Pts n={r.neto}/></td></tr>)}</tbody>
    <tfoot><tr className="font-medium"><td className="pt-3">Total</td>{(["tareas","bonos","notasNeg","pens"] as const).map(k=><td key={k} className="pt-3 text-right tabular-nums">{sum(k)}</td>)}<td className="pt-3 text-right"><Pts n={sum("neto")}/></td></tr></tfoot></table></div></Card>
  <Card className="p-5"><h2 className="mb-4 text-lg">Penalizaciones por día</h2><div className="flex h-28 items-end gap-1" role="img" aria-label="Puntos restados por día del mes">
   {byDay.map((v,i)=><div key={i} className="flex h-full flex-1 items-end" title={`Día ${i+1}: ${v} pts`}><div className={`w-full rounded-t transition-[height] duration-700 ease-out ${v?"bg-clay":"bg-mist"}`} style={{height:`${v?Math.max(8,(Math.abs(v)/worst)*100):4}%`}}/></div>)}</div>
   <div className="mt-1 flex justify-between text-xs text-slate"><span>1</span><span>{byDay.length}</span></div></Card></div>}
