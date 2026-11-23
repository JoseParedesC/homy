import{Controller,Get,Global,Inject,Module}from"@nestjs/common";import{JwtModule}from"@nestjs/jwt";import{Prisma,JwtGuard}from"./core";
import{AuthController}from"./auth";import{HomeController}from"./home";import{MembersController,TasksController}from"./masters";
@Controller("health") class HealthController{constructor(@Inject(Prisma) private p:Prisma){}@Get() async ok(){await this.p.$queryRaw`SELECT 1`;return{ok:true}}}
@Global() @Module({imports:[JwtModule.register({global:true,secret:process.env.JWT_SECRET,signOptions:{expiresIn:process.env.JWT_EXPIRES_IN??"7d"}})],
 controllers:[HealthController,AuthController,HomeController,MembersController,TasksController],providers:[Prisma,JwtGuard],exports:[Prisma]})
export class AppModule{}
