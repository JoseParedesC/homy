import{BadRequestException,CanActivate,createParamDecorator,ExecutionContext,ForbiddenException,Injectable,UnauthorizedException}from"@nestjs/common";
import{JwtService}from"@nestjs/jwt";import{PrismaClient}from"@prisma/client";import{ZodTypeAny,z}from"zod";
@Injectable() export class Prisma extends PrismaClient{}
export interface Me{id:string;role:string;pfUid:string;pft:string;name:string}
@Injectable() export class JwtGuard implements CanActivate{
 constructor(private jwt:JwtService){}
 async canActivate(c:ExecutionContext){const r=c.switchToHttp().getRequest(),h=String(r.headers.authorization??"");if(!h.startsWith("Bearer "))throw new UnauthorizedException();
  try{const p=await this.jwt.verifyAsync(h.slice(7));r.me={...p,id:p.sub}}catch{throw new UnauthorizedException()}return true}}
export const CurrentMe=createParamDecorator((_:unknown,c:ExecutionContext)=>c.switchToHttp().getRequest().me as Me);
export const admin=(m:Me)=>{if(m.role!=="admin")throw new ForbiddenException("Solo el administrador puede hacerlo.")};
export const parse=<S extends ZodTypeAny>(s:S,b:unknown):z.infer<S>=>{const r=s.safeParse(b);if(!r.success)throw new BadRequestException({message:r.error.issues.map(i=>`${i.path.join(".")}: ${i.message}`)});return r.data};
// Cliente de personal-finance (API Nest: prefijo /api, Bearer JWT).
export async function pf<T>(path:string,token:string,init:{method?:string;body?:unknown}={}):Promise<T>{
 let r:Response;try{r=await fetch(`${process.env.FINANCE_API_URL}/api${path}`,{method:init.method,body:init.body?JSON.stringify(init.body):undefined,headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})}})}
 catch{throw new BadRequestException({message:"No hay conexión con personal-finance."})}
 if(r.status===401&&token)throw new UnauthorizedException({message:"La sesión de personal-finance expiró. Vuelve a iniciar sesión."});
 const b:any=await r.json().catch(()=>({}));if(!r.ok)throw new BadRequestException({message:[b.message].flat().filter(Boolean).join(", ")||`personal-finance respondió ${r.status}`});return b as T}
// Mes (YYYY-MM) de una fecha en la zona horaria del hogar.
export const monthOf=(d:Date)=>new Intl.DateTimeFormat("en-CA",{timeZone:process.env.APP_TIMEZONE??"America/Bogota"}).format(d).slice(0,7);
