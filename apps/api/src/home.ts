import{BadRequestException,Body,Controller,ForbiddenException,Get,Inject,NotFoundException,Param,Post,UseGuards}from"@nestjs/common";import{z}from"zod";
import{admin,CurrentMe,JwtGuard,Me,parse,pf,Prisma}from"./core";
const dateS=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
@Controller() @UseGuards(JwtGuard) export class HomeController{
 constructor(@Inject(Prisma) private p:Prisma){}
 // Snapshot que consume el front (miembros, tareas, asignaciones con notas, aportes).
 @Get("state") async state(@CurrentMe() me:Me){
  const[members,tasks,as,cs]=await Promise.all([this.p.member.findMany({orderBy:{name:"asc"}}),this.p.task.findMany({orderBy:{name:"asc"}}),
   this.p.assignment.findMany({orderBy:{createdAt:"desc"},include:{notes:{orderBy:{at:"asc"}}}}),this.p.contribution.findMany({orderBy:{createdAt:"desc"}})]);
  return{me:me.id,members,tasks,assignments:as,contributions:cs.map(c=>({...c,synced:!!c.financeTxId}))}}
 @Post("assignments") async assign(@CurrentMe() me:Me,@Body() b:unknown){admin(me);
  const d=parse(z.object({taskId:z.string(),memberId:z.string(),dueDate:dateS.optional()}),b),t=await this.p.task.findUnique({where:{id:d.taskId}});
  if(!t||!t.active)throw new NotFoundException("Tarea no disponible.");if(t.hasDueDate&&!d.dueDate)throw new BadRequestException({message:"Esta tarea exige fecha límite."});
  return this.p.assignment.create({data:{...d,dueDate:t.hasDueDate?d.dueDate:null}})}
 @Post("assignments/:id/toggle") async toggle(@CurrentMe() me:Me,@Param("id") id:string){
  const a=await this.p.assignment.findUnique({where:{id},include:{task:true}});if(!a)throw new NotFoundException();
  if(a.memberId!==me.id)throw new ForbiddenException("Solo el responsable puede marcarla como realizada.");const done=a.status==="pending";
  return this.p.assignment.update({where:{id},data:{status:done?"done":"pending",doneAt:done?new Date():null,earned:done?a.task.points:0}})}
 @Post("assignments/:id/notes") async note(@CurrentMe() me:Me,@Param("id") id:string,@Body() b:unknown){admin(me);
  const d=parse(z.object({text:z.string().trim().min(1).max(500),delta:z.number().int().min(-1000).max(1000)}),b);return this.p.note.create({data:{...d,assignmentId:id,by:me.name}})}
 private async send(id:string,me:Me,pocketId?:string){
  const c=await this.p.contribution.findUnique({where:{id},include:{member:true}});if(!c)throw new NotFoundException();if(me.role!=="admin"&&c.memberId!==me.id)throw new ForbiddenException();
  const tx=await pf<{id:string}>("/transactions",me.pft,{method:"POST",body:{amount:c.amount,type:"income",date:c.date,pocketId,description:`Aporte Homy · ${c.member.name}${c.note?` · ${c.note}`:""}`}});
  return this.p.contribution.update({where:{id},data:{financeTxId:tx.id}})}
 @Post("contributions") async contribute(@CurrentMe() me:Me,@Body() b:unknown){
  const d=parse(z.object({memberId:z.string().optional(),amount:z.number().int().positive(),date:dateS,note:z.string().max(200).optional(),pocketId:z.string().optional(),sync:z.boolean().optional()}),b);
  const c=await this.p.contribution.create({data:{memberId:me.role==="admin"?d.memberId??me.id:me.id,amount:d.amount,date:d.date,note:d.note||null}});
  if(d.sync===false)return c;try{return await this.send(c.id,me,d.pocketId)}catch(e:any){return{...c,syncError:e.response?.message??e.message}}}
 @Post("contributions/:id/sync") sync(@CurrentMe() me:Me,@Param("id") id:string,@Body() b:{pocketId?:string}){return this.send(id,me,b?.pocketId)}
 // Comunicación con personal-finance: comprueba conexión y que el uid coincida con el de la sesión.
 @Get("finance/status") async status(@CurrentMe() me:Me){try{const u=await pf<any>("/auth/me",me.pft);return{connected:true,matches:(u.uid??u.id)===me.pfUid}}catch(e:any){return{connected:false,matches:false,error:e.response?.message??e.message}}}
 @Get("finance/pockets") pockets(@CurrentMe() me:Me){return pf<unknown[]>("/pockets",me.pft)}}
