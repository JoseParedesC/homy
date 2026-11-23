import type{MasterSearchFn}from"@joseparedesc/master-components";import{api}from"./store";
export interface Pocket{id:string;name:string;active?:boolean}
export interface FinanceStatus{connected:boolean;matches:boolean;error?:string}
export const financeStatus=()=>api<FinanceStatus>("/finance/status");
// El API de Homy hace de proxy hacia /api/pockets de personal-finance (sin CORS ni token en el navegador).
export const searchPockets:MasterSearchFn<Pocket>=async({query,page,pageSize})=>{
 const all=await api<Pocket[]>("/finance/pockets"),q=query.toLowerCase(),f=all.filter(p=>p.active!==false&&p.name.toLowerCase().includes(q));
 return{items:f.slice((page-1)*pageSize,page*pageSize),total:f.length}};
