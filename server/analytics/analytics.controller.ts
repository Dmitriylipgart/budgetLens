import { Controller, Get, Query, Param } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { PeriodQueryDto } from './dto/period-query.dto';

@Controller('analytics')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('overview')
  async overview(@CurrentUser() userId: number, @Query() query: PeriodQueryDto) {
    return this.analyticsService.getOverview(userId, query.from, query.to);
  }

  @Get('by-merchant')
  async byMerchant(
    @CurrentUser() userId: number,
    @Query() query: PeriodQueryDto,
    @Query('limit') limit?: number,
  ) {
    return this.analyticsService.getByMerchant(userId, query.from, query.to, limit || 20);
  }

  @Get('by-category')
  async byCategory(@CurrentUser() userId: number, @Query() query: PeriodQueryDto) {
    return this.analyticsService.getByCategory(userId, query.from, query.to);
  }

  @Get('trends')
  async trends(
    @CurrentUser() userId: number,
    @Query() query: PeriodQueryDto,
    @Query('granularity') granularity?: 'day' | 'week' | 'month',
  ) {
    return this.analyticsService.getTrends(userId, query.from, query.to, granularity || 'day');
  }

  @Get('recent')
  async recent(@CurrentUser() userId: number) {
    return this.analyticsService.getRecent(userId);
  }
}
