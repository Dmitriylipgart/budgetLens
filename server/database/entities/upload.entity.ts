import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Statement } from './statement.entity';

@Entity('uploads')
@Index(['userId'])
export class Upload {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: number;

  @Column()
  filename: string;

  @Column()
  fileHash: string;

  @Column()
  status: string;

  @Column({ nullable: true })
  errorMessage: string;

  @ManyToOne(() => Statement, { nullable: true })
  statement: Statement;

  @Column({ nullable: true })
  statementId: number;

  @Column({ nullable: true })
  txnCount: number;

  @Column({ nullable: true })
  aiTokensUsed: number;

  @Column({ nullable: true })
  aiModel: string;

  @Column({ nullable: true })
  processingMs: number;

  @CreateDateColumn()
  createdAt: Date;
}
