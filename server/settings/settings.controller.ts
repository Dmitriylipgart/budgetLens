import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  async getAll(@CurrentUser() userId: number) {
    return this.settingsService.getAll(userId);
  }

  @Put(':key')
  async set(
    @CurrentUser() userId: number,
    @Param('key') key: string,
    @Body('value') value: string,
  ) {
    return this.settingsService.set(userId, key, value);
  }
}
