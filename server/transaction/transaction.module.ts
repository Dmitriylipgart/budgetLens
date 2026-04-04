import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction } from '../database/entities/transaction.entity';
import { Merchant } from '../database/entities/merchant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Merchant])],
  controllers: [TransactionController],
  providers: [TransactionService],
  exports: [TransactionService],
})
export class TransactionModule {}
