import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { Merchant } from '../database/entities/merchant.entity';
import { MerchantAlias } from '../database/entities/merchant-alias.entity';
import { Transaction } from '../database/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Merchant, MerchantAlias, Transaction])],
  controllers: [MerchantController],
  providers: [MerchantService],
  exports: [MerchantService],
})
export class MerchantModule {}
