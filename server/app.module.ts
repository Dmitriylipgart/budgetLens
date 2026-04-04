import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { TransactionModule } from './transaction/transaction.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MerchantModule } from './merchant/merchant.module';
import { StatementModule } from './statement/statement.module';
import { SettingsModule } from './settings/settings.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    // Serve frontend in production
    ...(process.env.NODE_ENV === 'production'
      ? [
          ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'client'),
            exclude: ['/api/(.*)'],
          }),
        ]
      : []),
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UploadModule,
    TransactionModule,
    AnalyticsModule,
    MerchantModule,
    StatementModule,
    SettingsModule,
  ],
})
export class AppModule {}
