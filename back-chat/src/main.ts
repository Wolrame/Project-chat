import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  /* app.enableCors({
    origin: 'http://localhost:3000', // Укажите адрес вашего фронтенда
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Разрешает передачу куки/авторизационных заголовков
  }); */
  app.enableCors({
    origin: 'http://localhost:3000', // Или ['http://localhost:3000'] для массива
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 5000, '0.0.0.0');
}
bootstrap();
