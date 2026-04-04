import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { MerchantAlias } from './merchant-alias.entity';
import { Transaction } from './transaction.entity';

@Entity('merchants')
@Unique(['userId', 'name'])
export class Merchant {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (u) => u.merchants, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  displayName: string;

  @Column({ default: 'high' })
  confidence: string;

  @Column({ nullable: true })
  categoryGroup: string;

  @Column({ nullable: true })
  icon: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MerchantAlias, (a) => a.merchant)
  aliases: MerchantAlias[];

  @OneToMany(() => Transaction, (t) => t.merchant)
  transactions: Transaction[];
}
