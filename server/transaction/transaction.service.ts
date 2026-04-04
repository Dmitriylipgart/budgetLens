import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Transaction } from '../database/entities/transaction.entity';
import { TransactionQueryDto } from './dto/transaction-query.dto';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private txnRepo: Repository<Transaction>,
  ) {}

  async findAll(userId: number, query: TransactionQueryDto) {
    const qb = this.txnRepo
      .createQueryBuilder('txn')
      .leftJoinAndSelect('txn.merchant', 'merchant')
      .where('txn.userId = :userId', { userId });

    this.applyFilters(qb, query);

    // Sorting
    const sortField = this.getSortField(query.sort || 'date');
    qb.orderBy(sortField, query.order || 'DESC');

    // Pagination
    const page = query.page || 1;
    const limit = query.limit || 50;
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      data: items.map((txn) => this.formatTransaction(txn)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private applyFilters(qb: SelectQueryBuilder<Transaction>, query: TransactionQueryDto) {
    if (query.from) {
      qb.andWhere('txn.date >= :from', { from: query.from });
    }
    if (query.to) {
      qb.andWhere('txn.date <= :to', {
        to: query.to + 'T23:59:59',
      });
    }
    if (query.merchantId) {
      qb.andWhere('txn.merchantId = :merchantId', {
        merchantId: query.merchantId,
      });
    }
    if (query.category) {
      qb.andWhere('txn.bankCategory = :category', {
        category: query.category,
      });
    }
    if (query.direction) {
      qb.andWhere('txn.direction = :direction', {
        direction: query.direction,
      });
    }
    if (query.card) {
      qb.andWhere('txn.card = :card', { card: query.card });
    }
    if (query.minAmount !== undefined) {
      qb.andWhere('ABS(txn.accountAmount) >= :minAmount', {
        minAmount: query.minAmount,
      });
    }
    if (query.maxAmount !== undefined) {
      qb.andWhere('ABS(txn.accountAmount) <= :maxAmount', {
        maxAmount: query.maxAmount,
      });
    }
    if (query.search) {
      qb.andWhere('(txn.rawDescription LIKE :search OR merchant.name LIKE :search)', {
        search: `%${query.search}%`,
      });
    }
  }

  private getSortField(sort: string): string {
    const allowed: Record<string, string> = {
      date: 'txn.date',
      amount: 'txn.accountAmount',
      merchant: 'merchant.name',
      category: 'txn.bankCategory',
    };
    return allowed[sort] || 'txn.date';
  }

  private formatTransaction(txn: Transaction) {
    return {
      id: txn.id,
      date: txn.date,
      settledDate: txn.settledDate,
      rawDescription: txn.rawDescription,
      merchant: txn.merchant
        ? {
            id: txn.merchant.id,
            name: txn.merchant.displayName || txn.merchant.name,
          }
        : null,
      amount: txn.amount,
      currency: txn.currency,
      accountAmount: txn.accountAmount,
      fee: txn.fee,
      bankCategory: txn.bankCategory,
      direction: txn.direction,
      card: txn.card,
      isBlocked: txn.isBlocked,
    };
  }
}
