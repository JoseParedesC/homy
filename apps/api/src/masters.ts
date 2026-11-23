import{Body,ConflictException,Controller,Delete,Get,HttpCode,Inject,Param,Patch,Post,Query,UseGuards}from"@nestjs/common";import{z}from"zod";
import{admin,CurrentMe,JwtGuard,Me,parse,Prisma}from"./core";
const base={code:z.string().regex(/^[A-Za-z0-9_-]{1,20}$/),name:z.string().trim().min(1).max(80),active:z.boolean().optional()};
const memberS=z.object({...base,role:z.enum(["admin","member"])});
const taskS=z.object({...base,points:z.number().int().min(0),hasDueDate:z.boolean(),hasValue:z.boolean(),value:z.number().int().min(0).nullish()})
 .refine(t=>!t.hasValue||(t.value??0)>0,{path:["value"],message:"Indica el valor si la tarea tiene valor definido."});
// Contrato REST de @joseparedesc/master-crud: list(search,status), get, create, PATCH, PATCH /active, GET /references, DELETE (409 {referencedBy}).
function master(path:string,model:"member"|"task",ref:"memberId"|"taskId",create:z.ZodTypeAny,update:z.ZodTypeAny){
 @Controller(path) @UseGuards(JwtGuard) class C{
  constructor(@Inject(Prisma) private p:Prisma){}
  private get d(){return(this.p as any)[model]}
  private async refs(id:string){const count=await this.p.assignment.count({where:{[ref]:id}});return count?[{description:"asignaciones",count}]:[]}
  private async keepAdmin(id:string,loses:boolean){if(model!=="member"||!loses)return;const m=await this.p.member.findUnique({where:{id}});
   if(m?.role==="admin"&&m.active&&await this.p.member.count({where:{role:"admin",active:true,id:{not:id}}})===0)throw new ConflictException({message:"Debe existir al menos un administrador activo."})}
  private async w<T>(f:()=>Promise<T>){try{return await f()}catch(e:any){if(e.code==="P2002")throw new ConflictException({message:"Ya existe un registro con ese código."});throw e}}
  @Get() list(@Query("search") s?:string,@Query("status") st?:string){return this.d.findMany({orderBy:{name:"asc"},where:{...(st==="active"?{active:true}:st==="inactive"?{active:false}:{}),...(s?.trim()?{OR:[{code:{contains:s.trim(),mode:"insensitive"}},{name:{contains:s.trim(),mode:"insensitive"}}]}:{})}})}
  @Get(":id") get(@Param("id") id:string){return this.d.findUnique({where:{id}})}
  @Get(":id/references") references(@Param("id") id:string){return this.refs(id)}
  @Post() create(@CurrentMe() m:Me,@Body() b:unknown){admin(m);return this.w(()=>this.d.create({data:{...parse(create,b),createdBy:m.name,updatedBy:m.name}}))}
  @Patch(":id/active") async active(@CurrentMe() m:Me,@Param("id") id:string,@Body() b:{active:boolean}){admin(m);await this.keepAdmin(id,!b.active);await this.d.update({where:{id},data:{active:!!b.active,updatedBy:m.name}});return{ok:true}}
  @Patch(":id") async patch(@CurrentMe() m:Me,@Param("id") id:string,@Body() b:unknown){admin(m);const{code:_c,...data}=parse(update,b) as any;await this.keepAdmin(id,data.role==="member"||data.active===false);await this.w(()=>this.d.update({where:{id},data:{...data,updatedBy:m.name}}));return{ok:true}}
  @Delete(":id") @HttpCode(204) async remove(@CurrentMe() m:Me,@Param("id") id:string){admin(m);await this.keepAdmin(id,true);const r=await this.refs(id);if(r.length)throw new ConflictException({message:"El registro está en uso.",referencedBy:r});await this.d.delete({where:{id}})}}
 return C}
export const MembersController=master("members","member","memberId",memberS,memberS.omit({code:true}).partial());
export const TasksController=master("tasks","task","taskId",taskS,z.object({...base,points:z.number().int().min(0),hasDueDate:z.boolean(),hasValue:z.boolean(),value:z.number().int().min(0).nullish()}).omit({code:true}).partial());
