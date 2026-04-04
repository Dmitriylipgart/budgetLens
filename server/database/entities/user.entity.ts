import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Statement } from './statement.entity';
import { Transaction } from './transaction.entity';
import { Merchant } from './merchant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: 'Default User' })
  displayName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => Statement, (s) => s.user)
  statements: Statement[];

  @OneToMany(() => Transaction, (t) => t.user)
  transactions: Transaction[];

  @OneToMany(() => Merchant, (m) => m.user)
  merchants: Merchant[];
}
