import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { ClaudeParseService } from './services/claude-parse.service';
import { GeminiParseService } from './services/gemini-parse.service';
import { ImportService } from './services/import.service';
import { AI_PARSE_SERVICE } from './services/ai-parse.interface';
import { Upload } from '@server/database/entities';
import { Statement } from '@server/database/entities';
import { Transaction } from '@server/database/entities';
import { Merchant } from '@server/database/entities';
import { MerchantAlias } from '@server/database/entities';
import { BankFormat } from '@server/database/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Upload, Statement, Transaction, Merchant, MerchantAlias, BankFormat]),
  ],
  controllers: [UploadController],
  providers: [
    // Factory provider: picks Claude or Gemini based on AI_PROVIDER env var
    {
      provide: AI_PARSE_SERVICE,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('AI_PROVIDER') || 'claude';
        if (provider === 'gemini') {
          return new GeminiParseService(configService);
        }
        return new ClaudeParseService(configService);
      },
      inject: [ConfigService],
    },
    ImportService,
  ],
  exports: [AI_PARSE_SERVICE, ImportService],
})
export class UploadModule {}
