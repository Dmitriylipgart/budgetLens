import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@server/common/filters/';
import { TransformInterceptor } from '@server/common/interceptors/';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const host = configService.get<string>('HOST', 'localhost');
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');
  const trustProxy = configService.get<string>('TRUST_PROXY', 'false');

  if (trustProxy === 'true') {
    app.getHttpAdapter().getInstance().set('trust proxy', true);
  }

  app.enableCors({
    origin: corsOrigin === '*' ? true : corsOrigin.split(','),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(port, host);
  console.log(`🔎 BudgetLens running on http://${host}:${port}`);
}

bootstrap().catch(err => {
  console.error('Error during bootstrap:', err);
  process.exit(1);
});
