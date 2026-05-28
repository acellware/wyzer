import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap(): Promise<void> {
 // rawBody: true is required for Stripe webhook signature verification (T-046)
 const app = await NestFactory.create(AppModule, {
  rawBody: true,
  bufferLogs: true,
 });

 // Use structured JSON logger (pino via nestjs-pino)
 app.useLogger(app.get(Logger));

 // CORS — allow the web frontend origin; credentials required for HttpOnly cookie
 app.enableCors({
  origin: process.env['APP_URL'] ?? 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
 });

 // Security headers
 app.use(helmet());

 // Cookie parsing (for httpOnly refresh token)
 app.use(cookieParser());

 // Serialize response objects — respects @Exclude() / @Expose() on DTOs
 app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

 // Global prefix
 app.setGlobalPrefix('api/v1');

 // Global validation pipe using class-validator
 app.useGlobalPipes(
  new ValidationPipe({
   whitelist: true,
   forbidNonWhitelisted: true,
   transform: true,
   transformOptions: {
    enableImplicitConversion: true,
   },
  }),
 );

 // Global exception filter
 app.useGlobalFilters(new HttpExceptionFilter());

 // Swagger setup at /docs
 const config = new DocumentBuilder()
  .setTitle('Wyzer API')
  .setDescription('Wyzer Compliance Intelligence Platform — REST API')
  .setVersion('1.0')
  .addBearerAuth(
   { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
   'access-token',
  )
  .build();

 const document = SwaggerModule.createDocument(app, config);
 SwaggerModule.setup('docs', app, document, {
  swaggerOptions: {
   persistAuthorization: true,
  },
 });

 const port = process.env['PORT'] ?? 3001;
 await app.listen(port);
 console.log(`wyzer-api running on http://localhost:${port}`);
 console.log(`Swagger docs at http://localhost:${port}/docs`);
}

void bootstrap();
