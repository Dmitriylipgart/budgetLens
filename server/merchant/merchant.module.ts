import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { Merchant, MerchantAlias, Transaction } from '@server/database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant, MerchantAlias, Transaction])],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
