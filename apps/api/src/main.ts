import"dotenv/config";import"reflect-metadata";import{NestFactory}from"@nestjs/core";import{AppModule}from"./app.module";
async function bootstrap(){const app=await NestFactory.create(AppModule);app.setGlobalPrefix("api");
 app.enableCors({origin:process.env.CORS_ORIGIN?.split(",")??false,allowedHeaders:["Authorization","Content-Type"],methods:["GET","POST","PATCH","DELETE"]});
 app.enableShutdownHooks();await app.listen(Number(process.env.PORT??4000),"0.0.0.0")}
bootstrap();
