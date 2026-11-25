import{useEffect,useState}from"react";import{useDB}from"../../lib/store";import{monthName,monthRange}from"../../lib/period";import{Btn,Seg}from"../../ui";
import{initialPeriod,PeriodBar,periodOf}from"./PeriodBar";import{PenaltyForm}from"./PenaltyForm";import{RankingView}from"./RankingView";import{PenaltyView}from"./PenaltyView";import{MonthlyView}from"./MonthlyView";
type Tab="rank"|"pens"|"month";
export function Scoreboard(){
 const d=useDB(),admin=d.members.find(m=>m.id===d.me)?.role==="admin",[tab,setTab]=useState<Tab>("rank"),[s,setS]=useState(initialPeriod),[form,setForm]=useState(false),p=periodOf(s);
 useEffect(()=>{if(tab==="month"&&s.mode!=="month")setS(x=>({...x,mode:"month"}))},[tab,s.mode]); // el consolidado siempre es de un mes
 return<div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3">
  <Seg v={tab} set={setTab} opts={[["rank","Ranking"],["pens","Penalizaciones"],["month","Consolidado mensual"]]}/>
  {admin&&<Btn tone={form?"ghost":"clay"} onClick={()=>setForm(!form)}>{form?"Cerrar":"Penalizar"}</Btn>}</div>
  {admin&&form&&<div className="rise"><PenaltyForm/></div>}
  <div className="flex flex-wrap items-center gap-3"><PeriodBar s={s} set={setS} monthOnly={tab==="month"}/>{s.mode==="month"&&d.closes.some(c=>c.month===monthRange(s.y,s.m).from.slice(0,7))&&<span className="rise rounded-full bg-moss-light px-3 py-1 text-xs font-medium text-moss">Mes cerrado</span>}</div>
  <div key={tab} className="rise">{tab==="rank"?<RankingView d={d} p={p}/>:tab==="pens"?<PenaltyView d={d} p={p} admin={!!admin}/>:<MonthlyView d={d} p={p} title={monthName(s.y,s.m)} admin={!!admin}/>}</div></div>}
