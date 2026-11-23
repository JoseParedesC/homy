import{MasterSelector,type MasterSearchFn,type MasterSelectorProps}from"@joseparedesc/master-components";
import{getDB,type Member,type Task}from"../../lib/store";
import{searchPockets,type Pocket}from"../../lib/finance";
import{money}from"../../ui";
const local=<T extends{name:string;active:boolean}>(pick:()=>T[]):MasterSearchFn<T>=>async({query,page,pageSize})=>{
 const q=query.toLowerCase(),all=pick().filter(r=>r.active&&r.name.toLowerCase().includes(q));
 return{items:all.slice((page-1)*pageSize,page*pageSize),total:all.length}};
const searchMembers=local<Member>(()=>getDB().members),searchTasks=local<Task>(()=>getDB().tasks);
type P<T>=Omit<MasterSelectorProps<T>,"entity"|"search"|"getOptionLabel"|"getOptionValue">;
export const MemberSelect=(p:P<Member>)=><MasterSelector<Member> entity="members" search={searchMembers} getOptionLabel={m=>m.name} getOptionValue={m=>m.id}
 getOptionDescription={m=>m.role==="admin"?"Administrador":"Integrante"} placeholder="Buscar integrante" className="hogar" {...p}/>;
export const TaskSelect=(p:P<Task>)=><MasterSelector<Task> entity="tasks" search={searchTasks} getOptionLabel={t=>t.name} getOptionValue={t=>t.id}
 getOptionDescription={t=>`${t.points} pts${t.hasValue&&t.value?` · ${money(t.value)}`:""}${t.hasDueDate?" · con fecha límite":""}`} placeholder="Buscar tarea" className="hogar" {...p}/>;
export const PocketSelect=(p:P<Pocket>)=><MasterSelector<Pocket> entity="pockets" search={searchPockets} getOptionLabel={x=>x.name} getOptionValue={x=>x.id}
 placeholder="Bolsillo de destino (opcional)" className="hogar" {...p}/>;
