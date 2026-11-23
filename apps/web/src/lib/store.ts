import{useSyncExternalStore}from"react";import type{MasterEntity}from"@joseparedesc/master-crud";
export type Role="admin"|"member";
export interface Member extends MasterEntity{role:Role}
export interface Task extends MasterEntity{hasDueDate:boolean;hasValue:boolean;value?:number;points:number}
export interface Note{id:string;text:string;delta:number;by:string;at:string}
export interface Assignment{id:string;taskId:string;memberId:string;dueDate?:string;status:"pending"|"done";doneAt?:string;earned:number;notes:Note[]}
export interface Contribution{id:string;memberId:string;amount:number;date:string;note?:string|null;synced?:boolean}
export interface DB{members:Member[];tasks:Task[];assignments:Assignment[];contributions:Contribution[];me:string}
export const API=(import.meta.env.VITE_API_URL as string|undefined)??"http://localhost:4000";
const TK="homy:token";export const token=()=>sessionStorage.getItem(TK);
let db:DB|null=null;const subs=new Set<()=>void>(),emit=()=>subs.forEach(s=>s());
const sub=(f:()=>void)=>{subs.add(f);return()=>{subs.delete(f)}};
export async function api<T=void>(path:string,init:{method?:string;body?:unknown}={}):Promise<T>{
 const r=await fetch(`${API}/api${path}`,{method:init.method,body:init.body?JSON.stringify(init.body):undefined,headers:{"Content-Type":"application/json",...(token()?{Authorization:`Bearer ${token()}`}:{})}});
 if(r.status===401&&token())logout();
 if(!r.ok){const b=await r.json().catch(()=>({}));throw new Error([b.message].flat().filter(Boolean).join(", ")||`Error HTTP ${r.status}`)}
 return(r.status===204?undefined:await r.json()) as T}
export const refresh=async()=>{db=await api<DB>("/state");emit()};
export async function login(idToken:string){const r=await api<{accessToken:string}>("/auth/google",{method:"POST",body:{idToken}});sessionStorage.setItem(TK,r.accessToken);await refresh()}
export function logout(){sessionStorage.removeItem(TK);db=null;emit()}
export const useAuth=()=>({signedIn:useSyncExternalStore(sub,()=>!!token()&&db!==null)});
export const getDB=()=>db!;export const useDB=()=>useSyncExternalStore(sub,()=>db!);
export const today=()=>new Date().toISOString().slice(0,10);
export const scoreOf=(d:DB,id:string)=>d.assignments.filter(a=>a.memberId===id).reduce((s,a)=>s+(a.status==="done"?a.earned:0)+a.notes.reduce((n,x)=>n+x.delta,0),0);
const run=async<T,>(p:Promise<T>)=>{const r=await p;await refresh();return r};
export const assign=(taskId:string,memberId:string,dueDate?:string)=>run(api("/assignments",{method:"POST",body:{taskId,memberId,dueDate}}));
export const toggleDone=(id:string)=>run(api(`/assignments/${id}/toggle`,{method:"POST"}));
export const addNote=(id:string,text:string,delta:number,_by?:string)=>run(api(`/assignments/${id}/notes`,{method:"POST",body:{text,delta}}));
export const addContribution=(b:{memberId?:string;amount:number;date:string;note?:string;pocketId?:string})=>run(api<{syncError?:string}>("/contributions",{method:"POST",body:b}));
export const syncContribution=(id:string,pocketId?:string)=>run(api(`/contributions/${id}/sync`,{method:"POST",body:{pocketId}}));
export const setMe=(_:string)=>{};
