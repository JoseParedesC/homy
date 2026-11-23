import{useSyncExternalStore}from"react";import type{MasterEntity}from"@joseparedesc/master-crud";
export type Role="admin"|"member";
export interface Member extends MasterEntity{role:Role}
export interface Task extends MasterEntity{hasDueDate:boolean;hasValue:boolean;value?:number;points:number}
export interface Note{id:string;text:string;delta:number;by:string;at:string}
export interface Assignment{id:string;taskId:string;memberId:string;dueDate?:string;status:"pending"|"done";doneAt?:string;earned:number;notes:Note[]}
export interface Contribution{id:string;memberId:string;amount:number;date:string;note?:string;synced?:boolean}
export interface DB{members:Member[];tasks:Task[];assignments:Assignment[];contributions:Contribution[];me:string}
const KEY="hogar:v1",now=()=>new Date().toISOString(),uid=()=>crypto.randomUUID();
const base=()=>({active:true,id:uid(),createdAt:now(),updatedAt:now(),createdBy:"seed",updatedBy:"seed"});
function seed():DB{
 const m=(code:string,name:string,role:Role):Member=>({...base(),code,name,role});
 const t=(code:string,name:string,points:number,x:Partial<Task>={}):Task=>({...base(),code,name,points,hasDueDate:false,hasValue:false,...x});
 const members=[m("ADM","Administrador","admin"),m("ANA","Ana","member"),m("LUIS","Luis","member")];
 return{members,me:members[0].id,assignments:[],contributions:[],tasks:[t("PLATOS","Lavar los platos",2),t("BASURA","Sacar la basura",1),t("BANO","Limpiar el baño",5,{hasDueDate:true,hasValue:true,value:5000})]};}
function load():DB{try{const r=localStorage.getItem(KEY);if(r)return JSON.parse(r)}catch{}return seed()}
let db=load();const subs=new Set<()=>void>();
export const getDB=()=>db;
export function mutate(fn:(d:DB)=>void){const n=structuredClone(db);fn(n);db=n;try{localStorage.setItem(KEY,JSON.stringify(n))}catch{}subs.forEach(s=>s())}
export const useDB=()=>useSyncExternalStore(f=>{subs.add(f);return()=>{subs.delete(f)}},getDB);
export const today=()=>now().slice(0,10);
export const scoreOf=(d:DB,id:string)=>d.assignments.filter(a=>a.memberId===id).reduce((s,a)=>s+(a.status==="done"?a.earned:0)+a.notes.reduce((n,x)=>n+x.delta,0),0);
export const setMe=(id:string)=>mutate(d=>{d.me=id});
export const assign=(taskId:string,memberId:string,dueDate?:string)=>mutate(d=>{d.assignments.unshift({id:uid(),taskId,memberId,dueDate,status:"pending",earned:0,notes:[]})});
export const toggleDone=(id:string)=>mutate(d=>{const a=d.assignments.find(x=>x.id===id)!;const done=a.status==="pending";a.status=done?"done":"pending";a.doneAt=done?now():undefined;a.earned=done?d.tasks.find(t=>t.id===a.taskId)?.points??0:0});
export const addNote=(id:string,text:string,delta:number,by:string)=>mutate(d=>{d.assignments.find(x=>x.id===id)!.notes.push({id:uid(),text,delta,by,at:now()})});
export const addContribution=(c:Omit<Contribution,"id">)=>{const id=uid();mutate(d=>{d.contributions.unshift({...c,id})});return id};
export const markSynced=(id:string)=>mutate(d=>{d.contributions.find(c=>c.id===id)!.synced=true});
