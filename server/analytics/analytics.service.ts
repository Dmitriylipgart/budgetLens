import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../database/entities/transaction.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Transaction)
    private txnRepo: Repository<Transaction>,
  ) {}

  /**
   * Overview: totals for income, expense, net change, transaction count.
   */
  async getOverview(userId: number, from?: string, to?: string) {
    const qb = this.txnRepo
      .createQueryBuilder('txn')
      .where('txn.userId = :userId', { userId })
      .andWhere('txn.isBlocked = 0');

    if (from) qb.andWhere('txn.date >= :from', { from });
    if (to) qb.andWhere('txn.date <= :to', { to: to + 'T23:59:59' });

    const result = await qb
      .select([
        "SUM(CASE WHEN txn.direction = 'income' THEN txn.accountAmount ELSE 0 END) as totalIncome",
        "SUM(CASE WHEN txn.direction = 'expense' THEN ABS(txn.accountAmount) ELSE 0 END) as totalExpense",
        'COUNT(*) as transactionCount',
      ])
      .getRawOne();

    const totalIncome = parseFloat(result.totalIncome) || 0;
    const totalExpense = parseFloat(result.totalExpense) || 0;

    return {
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      netChange: Math.round((totalIncome - totalExpense) * 100) / 100,
      transactionCount: parseInt(result.transactionCount) || 0,
    };
  }

  /**
   * Spending grouped by merchant, sorted by total amount descending.
   */
  async getByMerchant(userId: number, from?: string, to?: string, limit: number = 20) {
    const qb = this.txnRepo
      .createQueryBuilder('txn')
      .leftJoin('txn.merchant', 'merchant')
      .where('txn.userId = :userId', { userId })
      .andWhere('txn.isBlocked = 0')
      .andWhere('txn.direction = :dir', { dir: 'expense' });

    if (from) qb.andWhere('txn.date >= :from', { from });
    if (to) qb.andWhere('txn.date <= :to', { to: to + 'T23:59:59' });

    const results = await qb
      .select([
        'merchant.id as merchantId',
        'COALESCE(merchant.displayName, merchant.name) as merchantName',
        'merchant.icon as icon',
        'SUM(ABS(txn.accountAmount)) as totalAmount',
        'COUNT(*) as transactionCount',
        'AVG(ABS(txn.accountAmount)) as avgAmount',
        'MAX(txn.date) as lastTransaction',
      ])
      .groupBy('merchant.id')
      .orderBy('totalAmount', 'DESC')
      .limit(limit)
      .getRawMany();

    return results.map((r) => ({
      merchantId: r.merchantId,
      merchantName: r.merchantName || 'Unknown',
      icon: r.icon,
      totalAmount: Math.round((parseFloat(r.totalAmount) || 0) * 100) / 100,
      transactionCount: parseInt(r.transactionCount) || 0,
      avgAmount: Math.round((parseFloat(r.avgAmount) || 0) * 100) / 100,
      lastTransaction: r.lastTransaction,
    }));
  }

  /**
   * Spending grouped by bank category.
   */
  async getByCategory(userId: number, from?: string, to?: string) {
    const qb = this.txnRepo
      .createQueryBuilder('txn')
      .where('txn.userId = :userId', { userId })
      .andWhere('txn.isBlocked = 0')
      .andWhere('txn.direction = :dir', { dir: 'expense' });

    if (from) qb.andWhere('txn.date >= :from', { from });
    if (to) qb.andWhere('txn.date <= :to', { to: to + 'T23:59:59' });

    const results = await qb
      .select([
        'txn.bankCategory as category',
        'SUM(ABS(txn.accountAmount)) as totalAmount',
        'COUNT(*) as transactionCount',
      ])
      .groupBy('txn.bankCategory')
      .orderBy('totalAmount', 'DESC')
      .getRawMany();

    return results.map((r) => ({
      category: r.category || 'Без категории',
      totalAmount: Math.round((parseFloat(r.totalAmount) || 0) * 100) / 100,
      transactionCount: parseInt(r.transactionCount) || 0,
    }));
  }

  /**
   * Spending trend: daily, weekly, or monthly aggregation.
   */
  async getTrends(
    userId: number,
    from?: string,
    to?: string,
    granularity: 'day' | 'week' | 'month' = 'day',
  ) {
    const qb = this.txnRepo
      .createQueryBuilder('txn')
      .where('txn.userId = :userId', { userId })
      .andWhere('txn.isBlocked = 0');

    if (from) qb.andWhere('txn.date >= :from', { from });
    if (to) qb.andWhere('txn.date <= :to', { to: to + 'T23:59:59' });

    let dateExpr: string;
    switch (granularity) {
      case 'month':
        dateExpr = 'SUBSTR(txn.date, 1, 7)'; // YYYY-MM
        break;
      case 'week':
        // SQLite: get the date and round down to Monday
        dateExpr = "DATE(txn.date, 'weekday 0', '-6 days')";
        break;
      case 'day':
      default:
        dateExpr = 'SUBSTR(txn.date, 1, 10)'; // YYYY-MM-DD
        break;
    }

    const results = await qb
      .select([
        `${dateExpr} as period`,
        "SUM(CASE WHEN txn.direction = 'income' THEN txn.accountAmount ELSE 0 END) as income",
        "SUM(CASE WHEN txn.direction = 'expense' THEN ABS(txn.accountAmount) ELSE 0 END) as expense",
        'COUNT(*) as transactionCount',
      ])
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    return results.map((r) => ({
      period: r.period,
      income: Math.round((parseFloat(r.income) || 0) * 100) / 100,
      expense: Math.round((parseFloat(r.expense) || 0) * 100) / 100,
      transactionCount: parseInt(r.transactionCount) || 0,
    }));
  }

  /**
   * Recent transactions for dashboard.
   */
  async getRecent(userId: number, limit: number = 10) {
    return this.txnRepo.find({
      where: { userId, isBlocked: false },
      relations: ['merchant'],
      order: { date: 'DESC' },
      take: limit,
    });
  }
}
