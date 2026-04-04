import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Statement } from '@server/database/entities';
import { Transaction } from '@server/database/entities';
import { Merchant } from '@server/database/entities';
import { MerchantAlias } from '@server/database/entities';
import { BankFormat } from '@server/database/entities';
import { ParseResult } from '../dto/parse-result.dto';

export interface ImportStats {
  statementId: number;
  transactionsImported: number;
  transactionsSkipped: number;
  newMerchants: number;
}

@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(Statement)
    private statementRepo: Repository<Statement>,
    @InjectRepository(Transaction)
    private transactionRepo: Repository<Transaction>,
    @InjectRepository(Merchant)
    private merchantRepo: Repository<Merchant>,
    @InjectRepository(MerchantAlias)
    private aliasRepo: Repository<MerchantAlias>,
    @InjectRepository(BankFormat)
    private bankFormatRepo: Repository<BankFormat>,
    private dataSource: DataSource,
  ) {}

  /**
   * Import parsed data into the database within a single transaction.
   */
  async import(
    data: ParseResult,
    userId: number,
    fileHash: string,
    filename: string,
  ): Promise<ImportStats> {
    // 1. Get bank format
    const bankFormat = await this.bankFormatRepo.findOne({
      where: { code: 'priorbank' },
    });
    if (!bankFormat) throw new Error('Priorbank format not found in database');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let stats: ImportStats = {
      statementId: 0,
      transactionsImported: 0,
      transactionsSkipped: 0,
      newMerchants: 0,
    };

    try {
      // 2. Create statement
      const statement = queryRunner.manager.create(Statement, {
        userId,
        bankFormatId: bankFormat!.id,
        periodFrom: data.statement.period.from,
        periodTo: data.statement.period.to,
        contract: data.statement.contractNumber,
        cardholder: data.statement.cardholder,
        currency: data.statement.currency || 'BYN',
        openingBalance: data.statement.openingBalance,
        closingBalance: data.statement.closingBalance,
        totalIncome: data.statement.totalIncome,
        totalExpense: data.statement.totalExpense,
        fileHash,
        rawFilename: filename,
      });
      const savedStatement = await queryRunner.manager.save(statement);
      stats.statementId = savedStatement.id;

      // 3. Build merchant alias cache for this user
      const existingAliases = await this.aliasRepo.find({
        where: { userId },
        relations: ['merchant'],
      });
      const aliasCache = new Map<string, number>(); // rawPattern → merchantId
      for (const alias of existingAliases) {
        aliasCache.set(alias.rawPattern, alias.merchantId);
      }

      // 4. Upsert merchants and build mapping
      const merchantIdByName = new Map<string, number>();
      let newMerchantCount = 0;

      // Collect all unique merchants from transactions
      const allTxns = [...data.transactions, ...(data.blockedTransactions || [])];
      const merchantSet = new Map<string, { confidence: string; categories: Set<string> }>();

      for (const txn of allTxns) {
        if (!merchantSet.has(txn.merchant)) {
          merchantSet.set(txn.merchant, {
            confidence: txn.merchantConfidence || 'high',
            categories: new Set(),
          });
        }
        if (txn.bankCategory) {
          merchantSet.get(txn.merchant)!.categories.add(txn.bankCategory);
        }
      }

      for (const [name, info] of merchantSet) {
        // Check if we already have this merchant for this user
        let merchant = await queryRunner.manager.findOne(Merchant, {
          where: { userId, name },
        });

        if (!merchant) {
          // Find category group from the merchant summary if available
          const summaryEntry = data.merchantSummary?.find((m) => m.merchant === name);

          merchant = queryRunner.manager.create(Merchant, {
            userId,
            name,
            confidence: info.confidence,
            categoryGroup: this.deriveCategoryGroup(Array.from(info.categories)) || undefined,
          });
          merchant = await queryRunner.manager.save(merchant);
          newMerchantCount++;
        }

        merchantIdByName.set(name, merchant.id);
      }

      // 5. Create aliases for new raw patterns
      for (const txn of allTxns) {
        const rawDesc = txn.rawDescription;
        if (!aliasCache.has(rawDesc)) {
          const merchantId = merchantIdByName.get(txn.merchant);
          if (merchantId) {
            const alias = queryRunner.manager.create(MerchantAlias, {
              userId,
              merchantId,
              rawPattern: rawDesc,
            });
            await queryRunner.manager.save(alias);
            aliasCache.set(rawDesc, merchantId);
          }
        }
      }

      // 6. Insert transactions with dedup
      let imported = 0;
      let skipped = 0;

      for (const txn of data.transactions) {
        // Check for duplicate (overlapping periods)
        const existing = await queryRunner.manager.findOne(Transaction, {
          where: {
            userId,
            date: txn.date,
            rawDescription: txn.rawDescription,
            amount: txn.amount,
            ...(txn.card ? { card: txn.card } : {}),
          },
        });

        if (existing) {
          skipped++;
          continue;
        }

        const merchantId = aliasCache.get(txn.rawDescription) || merchantIdByName.get(txn.merchant);

        const transaction = queryRunner.manager.create(Transaction, {
          userId,
          statementId: savedStatement.id,
          txnRef: txn.id,
          date: txn.date,
          settledDate: txn.settledDate,
          rawDescription: txn.rawDescription,
          merchantId: merchantId || undefined,
          amount: txn.amount,
          currency: txn.currency || 'BYN',
          accountAmount: txn.accountAmount,
          fee: txn.fee || 0,
          bankCategory: txn.bankCategory,
          direction: txn.direction,
          card: txn.card,
          isBlocked: false,
        });
        await queryRunner.manager.save(transaction);
        imported++;
      }

      // 7. Insert blocked transactions
      for (const txn of data.blockedTransactions || []) {
        const merchantId = aliasCache.get(txn.rawDescription) || merchantIdByName.get(txn.merchant);

        const transaction = queryRunner.manager.create(Transaction, {
          userId,
          statementId: savedStatement.id,
          txnRef: txn.id,
          date: txn.date,
          rawDescription: txn.rawDescription,
          merchantId: merchantId || undefined,
          amount: txn.amount,
          currency: txn.currency || 'BYN',
          accountAmount: txn.holdAmount || txn.amount,
          fee: 0,
          bankCategory: txn.bankCategory,
          direction: 'expense' as const,
          card: txn.card,
          isBlocked: true,
        });
        await queryRunner.manager.save(transaction);
        imported++;
      }

      stats.transactionsImported = imported;
      stats.transactionsSkipped = skipped;
      stats.newMerchants = newMerchantCount;

      await queryRunner.commitTransaction();
      this.logger.log(
        `Import complete: ${imported} txns imported, ${skipped} skipped, ${newMerchantCount} new merchants`,
      );
    } catch (err: any) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Import failed, rolled back: ${err.message}`);
      throw err;
    } finally {
      await queryRunner.release();
    }

    return stats;
  }

  /**
   * Derive an English category group from Russian bank categories.
   */
  private deriveCategoryGroup(categories: string[]): string | undefined {
    const categoryMap: Record<string, string> = {
      'Магазины продуктовые': 'Food & Essentials',
      'Ресторация / бары / кафе': 'Food & Essentials',
      Аптеки: 'Health',
      'Медицинский сервис': 'Health',
      'Ветеринарный сервис': 'Health',
      'Магазины одежды': 'Shopping',
      'Магазины обуви': 'Shopping',
      'Магазины хозтоваров': 'Shopping',
      'Различные магазины': 'Shopping',
      'Интернет-магазины': 'Shopping',
      'Цифровые товары': 'Shopping',
      'Денежные переводы': 'Transfers',
      'Переводы с карты на карту': 'Transfers',
      'Поставщик  услуг': 'Transfers',
      'Снятие наличных': 'Cash',
      Развлечения: 'Lifestyle',
      'Бизнес услуги': 'Services',
      'Автозапчасти / ремонт авто': 'Transport',
      'Индивидуальные сервис провайдеры': 'Services',
      Прочее: 'Other',
    };

    for (const cat of categories) {
      if (categoryMap[cat]) return categoryMap[cat];
    }
    return undefined;
  }
}
