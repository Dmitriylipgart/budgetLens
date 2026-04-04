import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from '@server/database/entities';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private settingRepo: Repository<Setting>,
  ) {}

  async getAll(userId: number): Promise<Record<string, string>> {
    const settings = await this.settingRepo.find({ where: { userId } });
    const result: Record<string, string> = {};
    for (const s of settings) {
      result[s.key] = s.value;
    }
    return result;
  }

  async get(userId: number, key: string): Promise<string | null> {
    const setting = await this.settingRepo.findOne({
      where: { userId, key },
    });
    return setting?.value || null;
  }

  async set(userId: number, key: string, value: string) {
    let setting = await this.settingRepo.findOne({
      where: { userId, key },
    });
    if (setting) {
      setting.value = value;
    } else {
      setting = this.settingRepo.create({ userId, key, value });
    }
    return this.settingRepo.save(setting);
  }
}
