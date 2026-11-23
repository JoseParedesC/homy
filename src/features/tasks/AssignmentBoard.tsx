import{useDB}from"../../lib/store";import{AssignForm}from"./AssignForm";import{AssignmentCard}from"./AssignmentCard";
export function AssignmentBoard(){
 const d=useDB(),me=d.members.find(m=>m.id===d.me)!,list=me.role==="admin"?d.assignments:d.assignments.filter(a=>a.memberId===me.id);
 return<div className="space-y-5">{me.role==="admin"&&<AssignForm/>}
  <div className="space-y-3">{list.map(a=><AssignmentCard key={a.id} a={a} me={me}/>)}
  {!list.length&&<p className="rounded-xl2 border border-dashed border-line p-10 text-center text-slate">{me.role==="admin"?"Asigna la primera tarea con el formulario de arriba.":"No tienes tareas asignadas."}</p>}</div></div>}
