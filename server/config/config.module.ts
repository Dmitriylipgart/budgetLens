import { Module, Global } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import configuration from './configuration';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').default('development'),
        APP_MODE: Joi.string().valid('single_user', 'multi_user').default('single_user'),
        PORT: Joi.number().default(3000),
        HOST: Joi.string().default('localhost'),
        DB_PATH: Joi.string().default('./data/budgetlens.db'),
        JWT_SECRET: Joi.string().default('dev-secret-change-me'),
        DEFAULT_USER_EMAIL: Joi.string().default('owner@local'),
        ANTHROPIC_API_KEY: Joi.string().optional().default(''),
        GEMINI_API_KEY: Joi.string().optional().default(''),
        AI_PROVIDER: Joi.string().valid('claude', 'gemini').default('claude'),
        AI_MODEL: Joi.string().default('claude-haiku-4-5-20251001'),
        AI_MAX_TOKENS: Joi.number().default(16000),
        UPLOAD_DIR: Joi.string().default('./data/uploads'),
        MAX_FILE_SIZE_MB: Joi.number().default(10),
        CORS_ORIGIN: Joi.string().default('*'),
        TRUST_PROXY: Joi.string().default('false'),
      }),
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}
