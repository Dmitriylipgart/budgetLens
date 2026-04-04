import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { BankFormat } from './bank-format.entity';
import { Transaction } from './transaction.entity';

@Entity('statements')
@Unique(['userId', 'fileHash'])
@Index(['userId'])
@Index(['periodFrom', 'periodTo'])
export class Statement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.statements, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => BankFormat)
  bankFormat: BankFormat;

  @Column()
  bankFormatId: number;

  @Column()
  periodFrom: string;

  @Column()
  periodTo: string;

  @Column({ nullable: true })
  contract: string;

  @Column({ nullable: true })
  cardholder: string;

  @Column({ default: 'BYN' })
  currency: string;

  @Column({ type: 'real', nullable: true })
  openingBalance: number;

  @Column({ type: 'real', nullable: true })
  closingBalance: number;

  @Column({ type: 'real', nullable: true })
  totalIncome: number;

  @Column({ type: 'real', nullable: true })
  totalExpense: number;

  @Column()
  fileHash: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @Column({ nullable: true })
  rawFilename: string;

  @OneToMany(() => Transaction, (t) => t.statement)
  transactions: Transaction[];
}
