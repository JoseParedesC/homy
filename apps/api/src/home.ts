import{BadRequestException,Body,Controller,Delete,ForbiddenException,Get,HttpCode,Inject,NotFoundException,Param,Post,UseGuards}from"@nestjs/common";import{z}from"zod";
import{admin,CurrentMe,JwtGuard,Me,parse,pf,Prisma}from"./core";
const dateS=z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
@Controller() @UseGuards(JwtGuard) export class HomeController{
 constructor(@Inject(Prisma) private p:Prisma){}
 // Snapshot que consume el front (miembros, tareas, asignaciones con notas, aportes).
 @Get("state") async state(@CurrentMe() me:Me){
  const[members,tasks,as,cs,pens]=await Promise.all([this.p.member.findMany({orderBy:{name:"asc"}}),this.p.task.findMany({orderBy:{name:"asc"}}),
   this.p.assignment.findMany({orderBy:{createdAt:"desc"},include:{notes:{orderBy:{at:"asc"}}}}),this.p.contribution.findMany({orderBy:{createdAt:"desc"}}),this.p.penalty.findMany({orderBy:{createdAt:"desc"}})]);
  return{me:me.id,members,tasks,assignments:as,contributions:cs.map(c=>({...c,synced:!!c.financeTxId})),penalties:pens}}
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
 // Penalización: el administrador resta puntos a un integrante, con motivo (y tarea opcional).
 @Post("penalties") async penalize(@CurrentMe() me:Me,@Body() b:unknown){admin(me);
  const d=parse(z.object({memberId:z.string(),points:z.number().int().min(1).max(1000),reason:z.string().trim().min(1).max(300),assignmentId:z.string().optional()}),b);
  const m=await this.p.member.findUnique({where:{id:d.memberId}});if(!m||!m.active)throw new NotFoundException("Integrante no disponible.");
  if(d.assignmentId){const a=await this.p.assignment.findUnique({where:{id:d.assignmentId}});if(!a||a.memberId!==d.memberId)throw new BadRequestException({message:"La tarea no pertenece a ese integrante."})}
  return this.p.penalty.create({data:{memberId:d.memberId,assignmentId:d.assignmentId??null,points:-d.points,reason:d.reason,by:me.name}})}
 @Delete("penalties/:id") @HttpCode(204) async unpenalize(@CurrentMe() me:Me,@Param("id") id:string){admin(me);await this.p.penalty.delete({where:{id}})}
 private async send(id:string,me:Me,pocketId?:string){
  const c=await this.p.contribution.findUnique({where:{id},include:{member:true}});if(!c)throw new NotFoundException();if(c.memberId!==me.id)throw new ForbiddenException("Solo el titular puede enviarlo a su cuenta de personal-finance.");
  const tx=await pf<{id:string}>("/transactions",me.pft,{method:"POST",body:{amount:c.amount,type:"income",date:c.date,pocketId,description:`Aporte Homy · ${c.member.name}${c.note?` · ${c.note}`:""}`}});
  return this.p.contribution.update({where:{id},data:{financeTxId:tx.id}})}
 @Post("contributions") async contribute(@CurrentMe() me:Me,@Body() b:unknown){
  const d=parse(z.object({memberId:z.string().optional(),amount:z.number().int().positive(),date:dateS,note:z.string().max(200).optional(),pocketId:z.string().optional(),sync:z.boolean().optional()}),b);
  // El aporte de otro integrante queda pendiente hasta que su titular lo envíe a su personal-finance.
  const c=await this.p.contribution.create({data:{memberId:me.role==="admin"?d.memberId??me.id:me.id,amount:d.amount,date:d.date,note:d.note||null}});
  if(d.sync===false||c.memberId!==me.id)return c;try{return await this.send(c.id,me,d.pocketId)}catch(e:any){return{...c,syncError:e.response?.message??e.message}}}
 @Post("contributions/:id/sync") sync(@CurrentMe() me:Me,@Param("id") id:string,@Body() b:{pocketId?:string}){return this.send(id,me,b?.pocketId)}
 // Comunicación con personal-finance: comprueba conexión y que el uid coincida con el de la sesión.
 @Get("finance/status") async status(@CurrentMe() me:Me){try{const u=await pf<any>("/auth/me",me.pft);return{connected:true,matches:(u.uid??u.id)===me.pfUid}}catch(e:any){return{connected:false,matches:false,error:e.response?.message??e.message}}}
 @Get("finance/pockets") pockets(@CurrentMe() me:Me){return pf<unknown[]>("/pockets",me.pft)}}
