import{useCallback,useState}from"react";import{addContribution,markSynced,today,useDB,type Member}from"../../lib/store";
import{financeEnabled,isLinked,postIncome,unlink,type Pocket}from"../../lib/finance";
import{Avatar,Btn,Card,Field,money}from"../../ui";import{MemberSelect,PocketSelect}from"../masters/selects";import{FinanceLink}from"./FinanceLink";
export function Contributions(){
 const d=useDB(),me=d.members.find(m=>m.id===d.me)!,admin=me.role==="admin";
 const[who,setWho]=useState<Member|null>(null),[amount,setAmount]=useState(""),[date,setDate]=useState(today()),[note,setNote]=useState(""),[pocket,setPocket]=useState<Pocket|null>(null);
 const[linked,setLinked]=useState(isLinked()),[err,setErr]=useState(""),[busy,setBusy]=useState(false),onLinked=useCallback(()=>setLinked(true),[]);
 const target=admin?who:me,n=Number(amount);
 async function push(id:string,m:string,a:number,dt:string,nt?:string,p?:string){
  await postIncome({amount:a,date:dt,pocketId:p,description:`Aporte hogar · ${m}${nt?` · ${nt}`:""}`});markSynced(id)}
 async function save(){if(!target||!(n>0))return;setBusy(true);setErr("");
  const id=addContribution({memberId:target.id,amount:n,date,note:note||undefined});
  try{if(linked)await push(id,target.name,n,date,note||undefined,pocket?.id)}catch(e){setErr(`Guardado en el hogar, pero no se envió a finanzas: ${(e as Error).message}`)}
  setAmount("");setNote("");setBusy(false)}
 const totals=d.members.map(m=>({m,t:d.contributions.filter(c=>c.memberId===m.id).reduce((s,c)=>s+c.amount,0)})).filter(x=>x.t>0);
 return<div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]"><div className="space-y-5">
  <Card className="space-y-4 p-5"><h2 className="text-lg">Registrar aporte</h2>
   {admin?<Field label="Integrante"><MemberSelect value={who} onChange={setWho}/></Field>:<p className="text-sm text-slate">Aporte de <b>{me.name}</b></p>}
   <div className="grid grid-cols-2 gap-3"><Field label="Monto (COP)"><input className="input" type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)}/></Field><Field label="Fecha"><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field></div>
   <Field label="Nota"><input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="Opcional"/></Field>
   {linked&&<Field label="Bolsillo en finanzas"><PocketSelect value={pocket} onChange={setPocket}/></Field>}
   {err&&<p role="alert" className="text-sm text-clay">{err}</p>}
   <Btn onClick={save} disabled={busy||!target||!(n>0)} className="w-full">Registrar aporte</Btn></Card>
  {financeEnabled&&<Card className="space-y-3 p-5"><h2 className="text-lg">Personal finance</h2>
   {linked?<><p className="text-sm text-moss">Conectado: cada aporte se envía como ingreso.</p><Btn tone="ghost" onClick={()=>{unlink();setLinked(false)}}>Desconectar</Btn></>
   :<><p className="text-sm text-slate">Inicia sesión para enviar los aportes como ingresos a tu cuenta.</p><FinanceLink onLinked={onLinked}/></>}</Card>}</div>
  <div className="space-y-5"><Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">{totals.map(({m,t})=><div key={m.id} className="flex items-center gap-2"><Avatar name={m.name}/><div><p className="text-xs text-slate">{m.name}</p><p className="font-display font-bold tabular-nums">{money(t)}</p></div></div>)}{!totals.length&&<p className="col-span-full text-sm text-slate">Sin aportes todavía.</p>}</Card>
   <Card className="divide-y divide-line">{d.contributions.map(c=><div key={c.id} className="flex items-center gap-3 p-4 text-sm"><div className="flex-1"><p className="font-medium">{d.members.find(m=>m.id===c.memberId)?.name} · {money(c.amount)}</p><p className="text-xs text-slate">{c.date}{c.note?` · ${c.note}`:""}</p></div>
    {c.synced?<span className="rounded-full bg-moss-light px-2.5 py-1 text-xs text-moss">En finanzas</span>:linked&&<Btn tone="ghost" onClick={()=>{const m=d.members.find(x=>x.id===c.memberId)!;push(c.id,m.name,c.amount,c.date,c.note,pocket?.id).catch(e=>setErr((e as Error).message))}}>Enviar</Btn>}</div>)}</Card></div></div>}
