import{useEffect,useState}from"react";import{addContribution,syncContribution,today,useDB,type Member}from"../../lib/store";
import{financeStatus,type FinanceStatus,type Pocket}from"../../lib/finance";
import{Avatar,Btn,Card,Field,money}from"../../ui";import{MemberSelect,PocketSelect}from"../masters/selects";
export function Contributions(){
 const d=useDB(),me=d.members.find(m=>m.id===d.me)!,admin=me.role==="admin";
 const[who,setWho]=useState<Member|null>(null),[amount,setAmount]=useState(""),[date,setDate]=useState(today()),[note,setNote]=useState(""),[pocket,setPocket]=useState<Pocket|null>(null);
 const[st,setSt]=useState<FinanceStatus|null>(null),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
 useEffect(()=>{financeStatus().then(setSt).catch(e=>setSt({connected:false,matches:false,error:e.message}))},[]);
 const target=admin?who:me,n=Number(amount),ok=st?.connected&&st.matches;
 async function save(){if(!target||!(n>0))return;setBusy(true);setErr("");
  try{const r=await addContribution({memberId:target.id,amount:n,date,note:note||undefined,pocketId:pocket?.id});if(r?.syncError)setErr(`Guardado en Homy, pero no se envió a finanzas: ${r.syncError}`);setAmount("");setNote("")}catch(e){setErr((e as Error).message)}setBusy(false)}
 const totals=d.members.map(m=>({m,t:d.contributions.filter(c=>c.memberId===m.id).reduce((s,c)=>s+c.amount,0)})).filter(x=>x.t>0);
 return<div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]"><div className="space-y-5">
  <Card className="space-y-4 p-5"><h2 className="text-lg">Registrar aporte</h2>
   {admin?<Field label="Integrante"><MemberSelect value={who} onChange={setWho}/></Field>:<p className="text-sm text-slate">Aporte de <b>{me.name}</b></p>}
   <div className="grid grid-cols-2 gap-3"><Field label="Monto (COP)"><input className="input" type="number" min="0" value={amount} onChange={e=>setAmount(e.target.value)}/></Field><Field label="Fecha"><input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/></Field></div>
   <Field label="Nota"><input className="input" value={note} onChange={e=>setNote(e.target.value)} placeholder="Opcional"/></Field>
   {ok&&<Field label="Bolsillo en finanzas"><PocketSelect value={pocket} onChange={setPocket}/></Field>}
   {err&&<p role="alert" className="text-sm text-clay">{err}</p>}
   <Btn onClick={save} disabled={busy||!target||!(n>0)} className="w-full">Registrar aporte</Btn></Card>
  <Card className="p-5 text-sm"><h2 className="mb-2 text-lg">Personal finance</h2>{!st?<p className="text-slate">Comprobando conexión…</p>:ok?<p className="text-moss">Conectado: tu usuario coincide y cada aporte se envía como ingreso.</p>:<p role="alert" className="text-clay">{st.connected?"Tu usuario de Homy no coincide con el de personal-finance.":`Sin conexión: ${st.error??"revisa FINANCE_API_URL"}`} Los aportes se guardan solo en Homy.</p>}</Card></div>
  <div className="space-y-5"><Card className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">{totals.map(({m,t})=><div key={m.id} className="flex items-center gap-2"><Avatar name={m.name}/><div><p className="text-xs text-slate">{m.name}</p><p className="font-display font-bold tabular-nums">{money(t)}</p></div></div>)}{!totals.length&&<p className="col-span-full text-sm text-slate">Sin aportes todavía.</p>}</Card>
   <Card className="divide-y divide-line">{d.contributions.map(c=><div key={c.id} className="flex items-center gap-3 p-4 text-sm"><div className="flex-1"><p className="font-medium">{d.members.find(m=>m.id===c.memberId)?.name} · {money(c.amount)}</p><p className="text-xs text-slate">{c.date}{c.note?` · ${c.note}`:""}</p></div>
    {c.synced?<span className="rounded-full bg-moss-light px-2.5 py-1 text-xs text-moss">En finanzas</span>:ok&&(admin||c.memberId===me.id)&&<Btn tone="ghost" onClick={()=>syncContribution(c.id,pocket?.id).catch(e=>setErr((e as Error).message))}>Enviar</Btn>}</div>)}</Card></div></div>}
