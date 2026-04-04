import { User } from './user.entity';
import { BankFormat } from './bank-format.entity';
import { Statement } from './statement.entity';
import { Transaction } from './transaction.entity';
import { Merchant } from './merchant.entity';
import { MerchantAlias } from './merchant-alias.entity';
import { Upload } from './upload.entity';
import { Setting } from './setting.entity';

export { User, BankFormat, Statement, Transaction, Merchant, MerchantAlias, Upload, Setting };

export const entities = [
  User,
  BankFormat,
  Statement,
  Transaction,
  Merchant,
  MerchantAlias,
  Upload,
  Setting,
];
