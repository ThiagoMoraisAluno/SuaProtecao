import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser = require('cookie-parser');
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PASSWORD_RESET_SECRET',
  'PORT',
];

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Variáveis de ambiente obrigatórias não configuradas: ${missing.join(', ')}`,
    );
  }
}

async function bootstrap(): Promise<void> {
  validateEnv();

  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Limite explícito de 1 MB — previne ataques de payload gigante
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Segurança: headers HTTP via Helmet
  app.use(helmet());

  // Cookie parser para suporte a httpOnly cookies
  app.use(cookieParser());

  // CORS restritivo — apenas origem configurada
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  const port = process.env.PORT ?? 3000;

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Sua Proteção API')
      .setDescription('API do sistema Sua Proteção | Reparo Certo')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, config),
    );
    console.log(`Docs: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);
  console.log(`API: http://localhost:${port}`);
}
bootstrap();
