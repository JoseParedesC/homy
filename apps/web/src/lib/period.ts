import type{DB}from"./store";
export type Mode="month"|"range"|"all";
export interface Period{from:string;to:string}
// Fechas en hora local (YYYY-MM-DD) para que un movimiento de las 8 p. m. no caiga en el día siguiente (UTC).
export const day=(iso:string)=>new Date(iso).toLocaleDateString("en-CA");
const ym=(y:number,m:number)=>`${y}-${String(m+1).padStart(2,"0")}`;
export const monthRange=(y:number,m:number):Period=>({from:`${ym(y,m)}-01`,to:`${ym(y,m)}-${String(new Date(y,m+1,0).getDate()).padStart(2,"0")}`});
export const monthName=(y:number,m:number)=>new Date(y,m,1).toLocaleDateString("es-CO",{month:"long",year:"numeric"});
export const dayLabel=(d:string)=>new Date(`${d}T12:00:00`).toLocaleDateString("es-CO",{weekday:"long",day:"numeric",month:"long"});
const inP=(iso:string|null|undefined,p:Period)=>!!iso&&day(iso)>=p.from&&day(iso)<=p.to;
export interface Entry{id:string;kind:"tarea"|"nota"|"penalizacion";at:string;memberId:string;pts:number;text:string;task?:string;by?:string;penaltyId?:string}
// Movimientos de puntos dentro del periodo: tarea hecha (por fecha de cumplimiento), notas y penalizaciones.
export function entries(d:DB,p:Period):Entry[]{
 const tn=(aid?:string|null)=>d.tasks.find(t=>t.id===d.assignments.find(a=>a.id===aid)?.taskId)?.name;
 return[...d.assignments.flatMap(a=>[
  ...(a.status==="done"&&inP(a.doneAt,p)?[{id:`t${a.id}`,kind:"tarea" as const,at:a.doneAt!,memberId:a.memberId,pts:a.earned,text:tn(a.id)??"Tarea",task:tn(a.id)}]:[]),
  ...a.notes.filter(n=>inP(n.at,p)).map(n=>({id:n.id,kind:"nota" as const,at:n.at,memberId:a.memberId,pts:n.delta,text:n.text,task:tn(a.id),by:n.by}))]),
  ...d.penalties.filter(x=>inP(x.createdAt,p)).map(x=>({id:x.id,kind:"penalizacion" as const,at:x.createdAt,memberId:x.memberId,pts:x.points,text:x.reason,task:tn(x.assignmentId),by:x.by,penaltyId:x.id}))
 ].sort((a,b)=>b.at.localeCompare(a.at))}
export interface Row{memberId:string;tareas:number;bonos:number;notasNeg:number;pens:number;neto:number;restado:number;nPens:number}
export function summary(d:DB,p:Period):Row[]{const es=entries(d,p);
 return d.members.filter(m=>m.active||es.some(e=>e.memberId===m.id)).map(m=>{
  const e=es.filter(x=>x.memberId===m.id),s=(f:(x:Entry)=>boolean)=>e.filter(f).reduce((t,x)=>t+x.pts,0);
  const tareas=s(x=>x.kind==="tarea"),bonos=s(x=>x.kind==="nota"&&x.pts>0),notasNeg=s(x=>x.kind==="nota"&&x.pts<0),pens=s(x=>x.kind==="penalizacion");
  return{memberId:m.id,tareas,bonos,notasNeg,pens,neto:tareas+bonos+notasNeg+pens,restado:notasNeg+pens,nPens:e.filter(x=>x.pts<0).length}})}
