import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('bank_formats')
export class BankFormat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  displayName: string;

  @Column({ default: 'windows-1251' })
  encoding: string;

  @Column({ default: ';' })
  delimiter: string;

  @Column()
  skillName: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
