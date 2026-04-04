import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Statement } from './statement.entity';
import { Merchant } from './merchant.entity';

@Entity('transactions')
@Unique(['statementId', 'txnRef'])
@Index(['userId', 'date'])
@Index(['userId', 'merchantId'])
@Index(['userId', 'bankCategory'])
@Index(['userId', 'direction'])
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.transactions, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Statement, (s) => s.transactions, { onDelete: 'CASCADE' })
  statement: Statement;

  @Column()
  statementId: number;

  @Column()
  txnRef: string;

  @Column()
  date: string;

  @Column({ nullable: true })
  settledDate: string;

  @Column()
  rawDescription: string;

  @ManyToOne(() => Merchant, (m) => m.transactions, { nullable: true })
  merchant: Merchant;

  @Column({ nullable: true })
  merchantId: number;

  @Column({ type: 'real' })
  amount: number;

  @Column({ default: 'BYN' })
  currency: string;

  @Column({ type: 'real' })
  accountAmount: number;

  @Column({ type: 'real', default: 0 })
  fee: number;

  @Column({ nullable: true })
  bankCategory: string;

  @Column()
  direction: string;

  @Column({ nullable: true })
  card: string;

  @Column({ default: false })
  isBlocked: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
