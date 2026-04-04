import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { BankFormat } from '../entities/bank-format.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(BankFormat)
    private bankFormatRepo: Repository<BankFormat>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedDefaultUser();
    await this.seedBankFormats();
  }

  private async seedDefaultUser() {
    const appMode = this.configService.get<string>('APP_MODE');
    if (appMode !== 'single_user') return;

    const existing = await this.userRepo.findOne({ where: { id: 1 } });
    if (existing) return;

    const user = this.userRepo.create({
      id: 1,
      email: this.configService.get<string>('DEFAULT_USER_EMAIL'),
      displayName: 'Owner',
    });
    await this.userRepo.save(user);
    this.logger.log('Default user created (single_user mode)');
  }

  private async seedBankFormats() {
    const existing = await this.bankFormatRepo.findOne({
      where: { code: 'priorbank' },
    });
    if (existing) return;

    const format = this.bankFormatRepo.create({
      code: 'priorbank',
      displayName: 'Priorbank / Приорбанк',
      encoding: 'windows-1251',
      delimiter: ';',
      skillName: 'bank-csv-parser',
      isActive: true,
    });
    await this.bankFormatRepo.save(format);
    this.logger.log('Priorbank format seeded');
  }
}
