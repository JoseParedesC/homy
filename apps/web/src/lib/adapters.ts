import{createRestAdapter,type MasterCrudAdapter,type MasterCrudConfig,type MasterEntity}from"@joseparedesc/master-crud";
import{API,refresh,token}from"./store";
// REST contra el API de Homy; tras cada escritura se refresca el caché usado por selectores y tarjetas.
export function makeAdapter<T extends MasterEntity>(cfg:MasterCrudConfig<T>):MasterCrudAdapter<T>{
 const a=createRestAdapter<T>(cfg,{baseUrl:`${API}/api`,getHeaders:async()=>({Authorization:`Bearer ${token()}`})});
 const w=<A extends unknown[],R>(f:(...x:A)=>Promise<R>)=>async(...x:A)=>{const r=await f(...x);void refresh();return r};
 return{...a,create:w(a.create),update:w(a.update),setActive:w(a.setActive),remove:w(a.remove)}}
