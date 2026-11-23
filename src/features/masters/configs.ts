import{z}from"zod";import{baseMasterSchema,type MasterCrudConfig}from"@joseparedesc/master-crud";
import type{Member,Task}from"../../lib/store";
import{makeAdapter}from"../../lib/adapters";
const empty=(v:unknown)=>v===""||(typeof v==="number"&&Number.isNaN(v))?undefined:v;
const date=(v:unknown)=>v?new Date(String(v)).toLocaleDateString("es-CO"):"—";
export const memberConfig:MasterCrudConfig<Member>={
 collection:"members",title:"Integrantes",singularTitle:"Integrante",codeField:"code",nameField:"name",searchableFields:["code","name"],
 columns:[{field:"code",label:"Código",sortable:true},{field:"name",label:"Nombre",sortable:true},{field:"role",label:"Rol",render:v=>v==="admin"?"Administrador":"Integrante"},{field:"active",label:"Estado"}],
 formFields:[{name:"code",label:"Código",type:"text",required:true,disabledOnEdit:true,helperText:"No se puede modificar después de creado."},{name:"name",label:"Nombre",type:"text",required:true},
  {name:"role",label:"Rol",type:"select",required:true,options:[{value:"member",label:"Integrante"},{value:"admin",label:"Administrador"}]}],
 references:[{collection:"assignments",field:"memberId",description:"asignaciones"}],allowDeactivate:true,
 validationSchema:baseMasterSchema.extend({role:z.enum(["admin","member"])})};
export const taskConfig:MasterCrudConfig<Task>={
 collection:"tasks",title:"Tareas del hogar",singularTitle:"Tarea",codeField:"code",nameField:"name",searchableFields:["code","name"],
 columns:[{field:"code",label:"Código",sortable:true},{field:"name",label:"Tarea",sortable:true},{field:"points",label:"Puntos",sortable:true,render:v=>String(v??0)},
  {field:"hasDueDate",label:"Fecha límite",render:v=>v?"Sí":"No"},{field:"value",label:"Valor",render:v=>v?`$${Number(v).toLocaleString("es-CO")}`:"—"},{field:"active",label:"Estado"},{field:"updatedAt",label:"Actualizado",render:date}],
 formFields:[{name:"code",label:"Código",type:"text",required:true,disabledOnEdit:true,helperText:"No se puede modificar después de creado."},{name:"name",label:"Nombre",type:"text",required:true},
  {name:"points",label:"Puntos al completarla",type:"number",required:true},
  {name:"hasDueDate",label:"Fecha límite",type:"boolean",helperText:"Exigir fecha límite al asignarla"},
  {name:"hasValue",label:"Valor definido",type:"boolean",helperText:"Tiene un valor en dinero"},{name:"value",label:"Valor (COP)",type:"number",helperText:"Solo si tiene valor definido"}],
 references:[{collection:"assignments",field:"taskId",description:"asignaciones"}],allowDeactivate:true,
 validationSchema:baseMasterSchema.extend({points:z.number().int().min(0),hasDueDate:z.boolean(),hasValue:z.boolean(),value:z.preprocess(empty,z.number().min(0).optional())})
  .refine(t=>!t.hasValue||(t.value??0)>0,{path:["value"],message:"Indica el valor si la tarea tiene valor definido."})};
export const memberAdapter=makeAdapter(memberConfig,"members","memberId");
export const taskAdapter=makeAdapter(taskConfig,"tasks","taskId");
