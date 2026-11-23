import{useState}from"react";import{assign,type Member,type Task}from"../../lib/store";
import{Btn,Card,Field}from"../../ui";import{MemberSelect,TaskSelect}from"../masters/selects";
export function AssignForm(){
 const[task,setTask]=useState<Task|null>(null),[who,setWho]=useState<Member|null>(null),[due,setDue]=useState("");
 const ok=task&&who&&(!task.hasDueDate||due);
 return<Card className="p-5"><h2 className="mb-4 text-lg">Asignar tarea</h2>
  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
   <Field label="Tarea"><TaskSelect value={task} onChange={t=>{setTask(t);if(!t?.hasDueDate)setDue("")}}/></Field>
   <Field label="Responsable"><MemberSelect value={who} onChange={setWho}/></Field>
   {task?.hasDueDate&&<Field label="Fecha límite"><input type="date" className="input rise" value={due} onChange={e=>setDue(e.target.value)}/></Field>}
   <Btn disabled={!ok} onClick={()=>{assign(task!.id,who!.id,due||undefined);setTask(null);setWho(null);setDue("")}}>Asignar</Btn></div></Card>}
