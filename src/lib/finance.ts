// Integración con personal-finance: Google ID token -> POST /api/auth/google -> JWT; luego /api/pockets y /api/transactions.
import type{MasterSearchFn}from"@kbayro/master-components";
const API=import.meta.env.VITE_FINANCE_API_URL as string|undefined,TK="pf:token";
export interface Pocket{id:string;name:string;active?:boolean}
export const financeEnabled=!!API;
export const isLinked=()=>!!sessionStorage.getItem(TK);
async function call<T>(path:string,init:RequestInit={}):Promise<T>{
 const t=sessionStorage.getItem(TK);
 const r=await fetch(`${API}/api${path}`,{...init,headers:{"Content-Type":"application/json",...(t?{Authorization:`Bearer ${t}`}:{})}});
 if(!r.ok){const b=await r.json().catch(()=>({}));throw new Error([b.message].flat().filter(Boolean).join(", ")||`Error HTTP ${r.status}`)}
 return r.json();}
export async function loginGoogle(idToken:string){const r=await call<{accessToken:string}>("/auth/google",{method:"POST",body:JSON.stringify({idToken})});sessionStorage.setItem(TK,r.accessToken)}
export const unlink=()=>sessionStorage.removeItem(TK);
export const postIncome=(b:{amount:number;description:string;date:string;pocketId?:string})=>call("/transactions",{method:"POST",body:JSON.stringify({...b,type:"income"})});
// /api/pockets devuelve todo: se filtra y pagina en memoria dentro de search.
export const searchPockets:MasterSearchFn<Pocket>=async({query,page,pageSize,signal})=>{
 const all=await call<Pocket[]>("/pockets",{signal});const q=query.toLowerCase();
 const f=all.filter(p=>p.active!==false&&p.name.toLowerCase().includes(q));
 return{items:f.slice((page-1)*pageSize,page*pageSize),total:f.length}};
