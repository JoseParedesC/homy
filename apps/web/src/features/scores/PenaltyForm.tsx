import{useState}from"react";import{isClosed,penalize,useDB,type Member}from"../../lib/store";import{Btn,Card,Field}from"../../ui";import{MemberSelect}from"../masters/selects";
export function PenaltyForm(){
 const d=useDB(),[who,setWho]=useState<Member|null>(null),[pts,setPts]=useState(""),[reason,setReason]=useState(""),[aid,setAid]=useState(""),[err,setErr]=useState("");
 const mine=who?d.assignments.filter(a=>a.memberId===who.id):[],n=Number(pts),ok=!!who&&n>0&&!!reason.trim(),locked=isClosed(d,new Date());
 return<Card className="space-y-4 p-5"><h2 className="text-lg">Penalizar</h2>
  <div className="grid gap-4 md:grid-cols-2"><Field label="Integrante"><MemberSelect value={who} onChange={m=>{setWho(m);setAid("")}}/></Field>
   <Field label="Puntos a restar"><input className="input" type="number" min="1" value={pts} onChange={e=>setPts(e.target.value)}/></Field></div>
  <Field label="Tarea relacionada (opcional)"><select className="input" value={aid} onChange={e=>setAid(e.target.value)} disabled={!who}><option value="">Ninguna</option>
   {mine.map(a=><option key={a.id} value={a.id}>{d.tasks.find(t=>t.id===a.taskId)?.name}{a.dueDate?` · ${a.dueDate}`:""}</option>)}</select></Field>
  <Field label="Motivo (nota)"><input className="input" value={reason} maxLength={300} onChange={e=>setReason(e.target.value)} placeholder="Ej. No lavó los platos a tiempo"/></Field>
  {locked&&<p className="text-sm text-clay">El mes actual está cerrado: reábrelo (Puntajes → Consolidado mensual) para penalizar.</p>}
  {err&&<p role="alert" className="text-sm text-clay">{err}</p>}
  <Btn tone="clay" disabled={!ok||locked} onClick={async()=>{setErr("");try{await penalize(who!.id,n,reason.trim(),aid||undefined);setPts("");setReason("");setAid("")}catch(e){setErr((e as Error).message)}}}>Aplicar penalización</Btn></Card>}
