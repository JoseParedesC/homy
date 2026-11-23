import"dotenv/config";import"reflect-metadata";import{NestFactory}from"@nestjs/core";import{AppModule}from"./app.module";
async function bootstrap(){const app=await NestFactory.create(AppModule);app.setGlobalPrefix("api");
 app.enableCors({origin:process.env.CORS_ORIGIN?.split(","),allowedHeaders:["Authorization","Content-Type"],methods:["GET","POST","PATCH","DELETE"]});
 await app.listen(Number(process.env.PORT??4000))}
bootstrap();
