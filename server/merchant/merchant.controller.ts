import { Controller, Get, Put, Post, Param, Body } from '@nestjs/common';
import { CurrentUser } from '@server/auth/decorators/current-user.decorator';
import { MerchantService } from './merchant.service';
import { UpdateMerchantDto, MergeMerchantDto } from './dto/update-merchant.dto';

@Controller('merchants')
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @Get()
  async findAll(@CurrentUser() userId: number) {
    return this.merchantService.findAll(userId);
  }

  @Get(':id')
  async findOne(@CurrentUser() userId: number, @Param('id') id: number) {
    return this.merchantService.findOne(userId, id);
  }

  @Put(':id')
  async update(
    @CurrentUser() userId: number,
    @Param('id') id: number,
    @Body() dto: UpdateMerchantDto,
  ) {
    return this.merchantService.update(userId, id, dto);
  }

  @Post('merge')
  async merge(@CurrentUser() userId: number, @Body() dto: MergeMerchantDto) {
    return this.merchantService.merge(userId, dto.sourceId, dto.targetId);
  }
}
