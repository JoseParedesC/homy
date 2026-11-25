import{Btn,Seg}from"../../ui";import{monthName,monthRange,type Mode,type Period}from"../../lib/period";
export interface PState{mode:Mode;y:number;m:number;from:string;to:string}
const now=new Date(),iso=(d:Date)=>d.toLocaleDateString("en-CA");
export const initialPeriod:PState={mode:"month",y:now.getFullYear(),m:now.getMonth(),from:"",to:""};
export const periodOf=(s:PState):Period=>s.mode==="month"?monthRange(s.y,s.m):s.mode==="range"?{from:s.from||"0000-01-01",to:s.to||"9999-12-31"}:{from:"0000-01-01",to:"9999-12-31"};
export function PeriodBar({s,set,monthOnly}:{s:PState;set:(x:PState)=>void;monthOnly?:boolean}){
 const shift=(n:number)=>{const t=new Date(s.y,s.m+n,1);set({...s,y:t.getFullYear(),m:t.getMonth()})};
 const last=(n:number)=>{const f=new Date();f.setDate(f.getDate()-n+1);set({...s,mode:"range",from:iso(f),to:iso(new Date())})};
 return<div className="flex flex-wrap items-center gap-3">
  {!monthOnly&&<Seg v={s.mode} set={mode=>set({...s,mode})} opts={[["month","Mes"],["range","Rango"],["all","Todo"]]}/>}
  {s.mode==="month"&&<div className="flex items-center gap-1"><Btn tone="ghost" aria-label="Mes anterior" onClick={()=>shift(-1)}>‹</Btn><span className="min-w-40 text-center font-display capitalize">{monthName(s.y,s.m)}</span><Btn tone="ghost" aria-label="Mes siguiente" onClick={()=>shift(1)}>›</Btn><Btn tone="ghost" onClick={()=>set({...s,y:now.getFullYear(),m:now.getMonth()})}>Hoy</Btn></div>}
  {s.mode==="range"&&<div className="rise flex flex-wrap items-center gap-2"><input type="date" className="input w-40" aria-label="Desde" value={s.from} max={s.to||undefined} onChange={e=>set({...s,from:e.target.value})}/><span className="text-slate">–</span>
   <input type="date" className="input w-40" aria-label="Hasta" value={s.to} min={s.from||undefined} onChange={e=>set({...s,to:e.target.value})}/><Btn tone="ghost" onClick={()=>last(7)}>7 días</Btn><Btn tone="ghost" onClick={()=>last(30)}>30 días</Btn></div>}</div>}
