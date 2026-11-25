import{useState}from"react";import{addNote,isClosed,toggleDone,today,useDB,type Assignment,type Member}from"../../lib/store";
import{Avatar,Btn,Card,money,Pts}from"../../ui";
export function AssignmentCard({a,me}:{a:Assignment;me:Member}){
 const d=useDB(),t=d.tasks.find(x=>x.id===a.taskId),who=d.members.find(x=>x.id===a.memberId),pens=d.penalties.filter(p=>p.assignmentId===a.id);
 const[open,setOpen]=useState(false),[text,setText]=useState(""),[pts,setPts]=useState(0),[sign,setSign]=useState<1|-1>(-1),[err,setErr]=useState("");
 const done=a.status==="done",late=!done&&!!a.dueDate&&a.dueDate<today(),admin=me.role==="admin",total=a.earned+a.notes.reduce((s,n)=>s+n.delta,0)+pens.reduce((s,p)=>s+p.points,0),count=a.notes.length+pens.length,locked=isClosed(d,new Date()),frozen=done?isClosed(d,a.doneAt??new Date()):locked;
 return<Card className={`p-4 transition duration-300 ${done?"bg-moss-light/40":""}`}><div className="flex items-center gap-3">
  <button className={`check ${done?"on":""}`} disabled={a.memberId!==me.id||frozen} onClick={()=>toggleDone(a.id).catch(e=>setErr((e as Error).message))} aria-label={done?"Marcar pendiente":"Marcar realizada"} title={frozen?"Mes cerrado":a.memberId===me.id?"":"Solo el responsable la marca"}>
   {done&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5 9-10"/></svg>}</button>
  <div className="min-w-0 flex-1"><p className={`font-medium ${done?"text-slate line-through":""}`}>{t?.name}</p>
   <p className="text-xs text-slate">{who?.name}{a.dueDate&&<span className={late?"font-semibold text-clay":""}> · vence {a.dueDate}{late?" (vencida)":""}</span>}{t?.hasValue&&t.value?` · ${money(t.value)}`:""}</p></div>
  <Pts n={total}/><Avatar name={who?.name??"?"}/>
  <Btn tone="ghost" onClick={()=>setOpen(!open)}>Notas{count?` (${count})`:""}</Btn></div>
  {err&&<p role="alert" className="mt-2 text-sm text-clay">{err}</p>}
  <div className={`reveal ${open?"open":""}`}><div><div className="mt-4 space-y-3 border-t border-line pt-4">
   {a.notes.map(n=><div key={n.id} className="flex justify-between gap-3 rounded-xl bg-mist px-3 py-2 text-sm"><span>{n.text}<span className="block text-xs text-slate">{n.by} · {new Date(n.at).toLocaleDateString("es-CO")}</span></span><Pts n={n.delta}/></div>)}
   {pens.map(p=><div key={p.id} className="flex justify-between gap-3 rounded-xl bg-clay-light px-3 py-2 text-sm"><span>{p.reason}<span className="block text-xs text-slate">Penalización · {p.by}</span></span><Pts n={p.points}/></div>)}
   {!count&&<p className="text-sm text-slate">Sin anotaciones.</p>}
   {admin&&<form className="flex flex-wrap gap-2" onSubmit={async e=>{e.preventDefault();if(!text.trim())return;setErr("");try{await addNote(a.id,text.trim(),sign*pts,me.name);setText("");setPts(0)}catch(x){setErr((x as Error).message)}}}>
    <input className="input min-w-48 flex-1" placeholder="Anotación del administrador" value={text} onChange={e=>setText(e.target.value)}/>
    <select className="input w-28" aria-label="Sumar o restar" value={sign} onChange={e=>setSign(Number(e.target.value) as 1|-1)}><option value={-1}>Restar</option><option value={1}>Sumar</option></select>
    <input className="input w-20" type="number" min="0" aria-label="Puntos" value={pts} onChange={e=>setPts(Math.max(0,Math.trunc(Number(e.target.value))))}/>
    <Btn type="submit" disabled={!text.trim()||locked} title={locked?"El mes actual está cerrado":undefined}>Anotar</Btn></form>}</div></div></div></Card>}
