import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  Index,
} from 'typeorm';
import { Merchant } from './merchant.entity';
import { User } from './user.entity';

@Entity('merchant_aliases')
@Unique(['userId', 'rawPattern'])
@Index(['userId', 'rawPattern'])
export class MerchantAlias {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Merchant, (m) => m.aliases, { onDelete: 'CASCADE' })
  merchant: Merchant;

  @Column()
  merchantId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column()
  rawPattern: string;

  @CreateDateColumn()
  createdAt: Date;
}
