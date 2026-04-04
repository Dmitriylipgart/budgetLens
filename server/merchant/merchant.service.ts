import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Merchant } from '../database/entities/merchant.entity';
import { MerchantAlias } from '../database/entities/merchant-alias.entity';
import { Transaction } from '../database/entities/transaction.entity';

@Injectable()
export class MerchantService {
  constructor(
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
    @InjectRepository(MerchantAlias)
    private aliasRepo: Repository<MerchantAlias>,
    @InjectRepository(Transaction)
    private txnRepo: Repository<Transaction>,
    private dataSource: DataSource,
  ) {}

  async findAll(userId: number) {
    const merchants = await this.merchantRepo
      .createQueryBuilder('m')
      .leftJoin('m.transactions', 'txn', 'txn.isBlocked = 0')
      .where('m.userId = :userId', { userId })
      .select([
        'm.id as id',
        'm.name as name',
        'm.displayName as displayName',
        'm.confidence as confidence',
        'm.categoryGroup as categoryGroup',
        'm.icon as icon',
        'COALESCE(SUM(txn.accountAmount), 0) as totalAmount',
        'COUNT(txn.id) as transactionCount',
        'MAX(txn.date) as lastTransaction',
      ])
      .groupBy('m.id')
      .orderBy('totalAmount', 'ASC') // Most spent first (negative amounts)
      .getRawMany();

    return merchants.map((m) => ({
      ...m,
      totalAmount: Math.round((parseFloat(m.totalAmount) || 0) * 100) / 100,
      transactionCount: parseInt(m.transactionCount) || 0,
    }));
  }

  async findOne(userId: number, id: number) {
    const merchant = await this.merchantRepo.findOne({
      where: { id, userId },
      relations: ['aliases'],
    });
    if (!merchant) throw new NotFoundException('Merchant not found');
    return merchant;
  }

  async update(
    userId: number,
    id: number,
    data: Partial<{
      displayName: string;
      categoryGroup: string;
      icon: string;
      notes: string;
    }>,
  ) {
    const merchant = await this.findOne(userId, id);
    Object.assign(merchant, data);
    return this.merchantRepo.save(merchant);
  }

  async merge(userId: number, sourceId: number, targetId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Reassign aliases
      await queryRunner.manager.update(
        MerchantAlias,
        { merchantId: sourceId, userId },
        { merchantId: targetId },
      );

      // Reassign transactions
      await queryRunner.manager.update(
        Transaction,
        { merchantId: sourceId, userId },
        { merchantId: targetId },
      );

      // Delete source merchant
      await queryRunner.manager.delete(Merchant, {
        id: sourceId,
        userId,
      });

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }

    return this.findOne(userId, targetId);
  }
}
