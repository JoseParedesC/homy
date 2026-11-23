import{useState}from"react";import{addNote,toggleDone,today,useDB,type Assignment,type Member}from"../../lib/store";
import{Avatar,Btn,Card,money,Pts}from"../../ui";
export function AssignmentCard({a,me}:{a:Assignment;me:Member}){
 const d=useDB(),t=d.tasks.find(x=>x.id===a.taskId),who=d.members.find(x=>x.id===a.memberId);
 const[open,setOpen]=useState(false),[text,setText]=useState(""),[delta,setDelta]=useState(0);
 const done=a.status==="done",late=!done&&!!a.dueDate&&a.dueDate<today(),admin=me.role==="admin",total=a.earned+a.notes.reduce((s,n)=>s+n.delta,0);
 return<Card className={`p-4 transition duration-300 ${done?"bg-moss-light/40":""}`}><div className="flex items-center gap-3">
  <button className={`check ${done?"on":""}`} disabled={a.memberId!==me.id} onClick={()=>toggleDone(a.id)} aria-label={done?"Marcar pendiente":"Marcar realizada"} title={a.memberId===me.id?"":"Solo el responsable la marca"}>
   {done&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5 9-10"/></svg>}</button>
  <div className="min-w-0 flex-1"><p className={`font-medium ${done?"text-slate line-through":""}`}>{t?.name}</p>
   <p className="text-xs text-slate">{who?.name}{a.dueDate&&<span className={late?"font-semibold text-clay":""}> · vence {a.dueDate}{late?" (vencida)":""}</span>}{t?.hasValue&&t.value?` · ${money(t.value)}`:""}</p></div>
  <Pts n={total}/><Avatar name={who?.name??"?"}/>
  <Btn tone="ghost" onClick={()=>setOpen(!open)}>Notas{a.notes.length?` (${a.notes.length})`:""}</Btn></div>
  <div className={`collapse ${open?"open":""}`}><div><div className="mt-4 space-y-3 border-t border-line pt-4">
   {a.notes.map(n=><div key={n.id} className="flex justify-between gap-3 rounded-xl bg-mist px-3 py-2 text-sm"><span>{n.text}<span className="block text-xs text-slate">{n.by} · {new Date(n.at).toLocaleDateString("es-CO")}</span></span><Pts n={n.delta}/></div>)}
   {!a.notes.length&&<p className="text-sm text-slate">Sin anotaciones.</p>}
   {admin&&<form className="flex flex-wrap gap-2" onSubmit={e=>{e.preventDefault();if(!text.trim())return;addNote(a.id,text.trim(),delta,me.name);setText("");setDelta(0)}}>
    <input className="input min-w-48 flex-1" placeholder="Anotación del administrador" value={text} onChange={e=>setText(e.target.value)}/>
    <input className="input w-24" type="number" aria-label="Puntos (negativo resta)" value={delta} onChange={e=>setDelta(Math.trunc(Number(e.target.value)))}/>
    <Btn type="submit" disabled={!text.trim()}>Anotar</Btn></form>}</div></div></div></Card>}
