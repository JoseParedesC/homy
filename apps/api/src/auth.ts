import{Body,Controller,ForbiddenException,Get,Inject,Post,UseGuards}from"@nestjs/common";import{JwtService}from"@nestjs/jwt";import{z}from"zod";
import{CurrentMe,JwtGuard,Me,parse,pf,Prisma}from"./core";
interface PfLogin{accessToken:string;user:{uid:string;name:string;email:string;picture?:string}}
@Controller("auth") export class AuthController{
 constructor(@Inject(Prisma) private p:Prisma,@Inject(JwtService) private jwt:JwtService){}
 // La identidad la valida personal-finance (mismo Google Client ID). El uid de PF es la llave de Homy.
 @Post("google") async google(@Body() b:unknown){
  const{idToken}=parse(z.object({idToken:z.string().min(10)}),b);
  const r=await pf<PfLogin>("/auth/google","",{method:"POST",body:{idToken}}),u=r.user;
  const email=u.email.trim().toLowerCase();
  let m=await this.p.member.findUnique({where:{pfUid:u.uid}})??await this.p.member.findUnique({where:{email}});
  if(!m){const noAdmin=(await this.p.member.count({where:{role:"admin"}}))===0;
   // Solo entra quien el administrador registró con su correo (el primer usuario crea el hogar). OPEN_REGISTRATION=true reabre el registro.
   if(!noAdmin&&process.env.OPEN_REGISTRATION!=="true")throw new ForbiddenException("Tu correo no está registrado en Homy. Pide al administrador que te agregue como integrante.");
   m=await this.p.member.create({data:{code:`${email.split("@")[0].replace(/[^A-Za-z0-9_-]/g,"").slice(0,14)}-${Math.random().toString(36).slice(2,6)}`,name:u.name,email,pfUid:u.uid,role:noAdmin?"admin":"member"}})}
  else if(!m.pfUid)m=await this.p.member.update({where:{id:m.id},data:{pfUid:u.uid}});
  else if(m.pfUid!==u.uid)throw new ForbiddenException("Ese correo ya está vinculado a otra cuenta de personal-finance.");
  if(!m.active)throw new ForbiddenException("Tu usuario está desactivado en Homy.");
  const accessToken=await this.jwt.signAsync({sub:m.id,role:m.role,pfUid:u.uid,pft:r.accessToken,name:m.name});
  return{accessToken,user:{id:m.id,name:m.name,email:u.email,role:m.role,picture:u.picture}}}
 @Get("me") @UseGuards(JwtGuard) me(@CurrentMe() m:Me){return{id:m.id,name:m.name,role:m.role,pfUid:m.pfUid}}}
