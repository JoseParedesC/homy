import{Body,Controller,ForbiddenException,Get,Inject,Post,UseGuards}from"@nestjs/common";import{JwtService}from"@nestjs/jwt";import{z}from"zod";
import{CurrentMe,JwtGuard,Me,parse,pf,Prisma}from"./core";
interface PfLogin{accessToken:string;user:{uid:string;name:string;email:string;picture?:string}}
@Controller("auth") export class AuthController{
 constructor(@Inject(Prisma) private p:Prisma,@Inject(JwtService) private jwt:JwtService){}
 // La identidad la valida personal-finance (mismo Google Client ID). El uid de PF es la llave de Homy.
 @Post("google") async google(@Body() b:unknown){
  const{idToken}=parse(z.object({idToken:z.string().min(10)}),b);
  const r=await pf<PfLogin>("/auth/google","",{method:"POST",body:{idToken}}),u=r.user;
  let m=await this.p.member.findUnique({where:{pfUid:u.uid}})??await this.p.member.findUnique({where:{email:u.email}});
  if(!m){const first=(await this.p.member.count({where:{role:"admin"}}))===0;
   m=await this.p.member.create({data:{code:`${u.email.split("@")[0].replace(/[^A-Za-z0-9_-]/g,"").slice(0,14)}-${Math.random().toString(36).slice(2,6)}`,name:u.name,email:u.email,pfUid:u.uid,role:first?"admin":"member"}})}
  else if(!m.pfUid)m=await this.p.member.update({where:{id:m.id},data:{pfUid:u.uid}});
  if(!m.active)throw new ForbiddenException("Tu usuario está desactivado en Homy.");
  const accessToken=await this.jwt.signAsync({sub:m.id,role:m.role,pfUid:u.uid,pft:r.accessToken,name:m.name});
  return{accessToken,user:{id:m.id,name:m.name,email:u.email,role:m.role,picture:u.picture}}}
 @Get("me") @UseGuards(JwtGuard) me(@CurrentMe() m:Me){return{id:m.id,name:m.name,role:m.role,pfUid:m.pfUid}}}
