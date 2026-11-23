import{Global,Module}from"@nestjs/common";import{JwtModule}from"@nestjs/jwt";import{Prisma,JwtGuard}from"./core";
import{AuthController}from"./auth";import{HomeController}from"./home";import{MembersController,TasksController}from"./masters";
@Global() @Module({imports:[JwtModule.register({global:true,secret:process.env.JWT_SECRET,signOptions:{expiresIn:process.env.JWT_EXPIRES_IN??"7d"}})],
 controllers:[AuthController,HomeController,MembersController,TasksController],providers:[Prisma,JwtGuard],exports:[Prisma]})
export class AppModule{}
