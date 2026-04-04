import { Controller, Get, Delete, Param } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StatementService } from './statement.service';

@Controller('statements')
export class StatementController {
  constructor(private statementService: StatementService) {}

  @Get()
  async findAll(@CurrentUser() userId: number) {
    return this.statementService.findAll(userId);
  }

  @Delete(':id')
  async delete(
    @CurrentUser() userId: number,
    @Param('id') id: number,
  ) {
    return this.statementService.delete(userId, id);
  }
}
