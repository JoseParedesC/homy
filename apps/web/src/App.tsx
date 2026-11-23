import{useEffect,useState}from"react";import{logout,refresh,token,useAuth,useDB}from"./lib/store";import{Login}from"./features/auth/Login";import{Btn}from"./ui";
import{AssignmentBoard}from"./features/tasks/AssignmentBoard";import{Scoreboard}from"./features/scores/Scoreboard";
import{Contributions}from"./features/contributions/Contributions";import{MastersPage}from"./features/masters/MastersPage";
const TABS=[["tasks","Tareas"],["scores","Puntajes"],["money","Aportes"],["masters","Maestros"]] as const;
export default function App(){
 const{signedIn}=useAuth();useEffect(()=>{if(token())refresh().catch(logout)},[]);
 return signedIn?<Shell/>:token()?null:<Login/>}
function Shell(){
 const d=useDB(),me=d.members.find(m=>m.id===d.me)!,tabs=me.role==="admin"?TABS:TABS.slice(0,3),[tab,setTab]=useState<string>("tasks"),i=Math.max(0,tabs.findIndex(t=>t[0]===tab));
 return<div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
  <header className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-bold">Homy</h1><p className="text-sm text-slate">Tareas, puntos y aportes de la casa</p></div>
   <div className="flex items-center gap-3 text-sm"><span>{me.name} · {me.role==="admin"?"Administrador":"Integrante"}</span><Btn tone="ghost" onClick={logout}>Salir</Btn></div></header>
  <nav className="relative grid rounded-xl bg-mist p-1 text-sm" style={{gridTemplateColumns:`repeat(${tabs.length},1fr)`}}>
   <span className="absolute inset-y-1 left-1 rounded-lg bg-surface shadow-soft transition-transform duration-300 ease-out" style={{width:`calc((100% - .5rem)/${tabs.length})`,transform:`translateX(${i*100}%)`}}/>
   {tabs.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`relative py-2 font-medium transition-colors ${tab===k?"text-ink":"text-slate"}`}>{l}</button>)}</nav>
  <main key={tabs[i][0]} className="rise">{tabs[i][0]==="tasks"?<AssignmentBoard/>:tabs[i][0]==="scores"?<Scoreboard/>:tabs[i][0]==="money"?<Contributions/>:<MastersPage uid={me.id}/>}</main></div>}
