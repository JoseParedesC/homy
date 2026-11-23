import{createRestAdapter,DuplicateCodeError,ReferencedEntityError,type MasterCrudAdapter,type MasterCrudConfig,type MasterEntity}from"@joseparedesc/master-crud";
import{getDB,mutate,type DB}from"./store";
const HOME=import.meta.env.VITE_HOME_API_URL as string|undefined;
type K="members"|"tasks";
function local<T extends MasterEntity>(key:K,ref:"memberId"|"taskId"):MasterCrudAdapter<T>{
 const rows=()=>getDB()[key] as unknown as T[];
 const put=(fn:(r:T[])=>T[])=>mutate(d=>{(d as DB)[key]=fn(d[key] as unknown as T[]) as never});
 const refs=(id:string)=>{const count=getDB().assignments.filter(a=>a[ref]===id).length;return count?[{description:"asignaciones",count}]:[]};
 const stamp=()=>new Date().toISOString();
 return{
  async list(f){const q=f.search.trim().toLowerCase();return rows().filter(r=>(f.status==="all"||r.active===(f.status==="active"))&&(!q||`${r.code} ${r.name}`.toLowerCase().includes(q)))},
  async getById(id){return rows().find(r=>r.id===id)??null},
  async create(input){
   if(rows().some(r=>r.code.toLowerCase()===String(input.code).toLowerCase()))throw new DuplicateCodeError(String(input.code));
   const e={active:true,...input,id:crypto.randomUUID(),createdAt:stamp(),updatedAt:stamp(),createdBy:"local",updatedBy:"local"} as T;put(r=>[...r,e]);return e},
  async update(id,ch){put(r=>r.map(x=>x.id===id?{...x,...ch,updatedAt:stamp()}:x))},
  async setActive(id,active){put(r=>r.map(x=>x.id===id?{...x,active,updatedAt:stamp()}:x))},
  async countReferences(id){return refs(id)},
  async remove(e){const r=refs(e.id);if(r.length)throw new ReferencedEntityError(e.name,r);put(x=>x.filter(y=>y.id!==e.id));return{softDeleted:false}}}}
// Con VITE_HOME_API_URL usa el contrato REST de master-crud; si no, localStorage.
export function makeAdapter<T extends MasterEntity>(cfg:MasterCrudConfig<T>,key:K,ref:"memberId"|"taskId"):MasterCrudAdapter<T>{
 return HOME?createRestAdapter<T>(cfg,{baseUrl:HOME,getHeaders:async()=>({})}):local<T>(key,ref)}
