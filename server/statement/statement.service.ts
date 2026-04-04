import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Statement } from '@server/database/entities';

@Injectable()
export class StatementService {
  constructor(
    @InjectRepository(Statement)
    private statementRepo: Repository<Statement>,
  ) {}

  async findAll(userId: number) {
    return this.statementRepo.find({
      where: { userId },
      order: { periodTo: 'DESC' },
      relations: ['bankFormat'],
    });
  }

  async delete(userId: number, id: number) {
    const statement = await this.statementRepo.findOne({
      where: { id, userId },
    });
    if (!statement) throw new NotFoundException('Statement not found');
    await this.statementRepo.remove(statement);
    return { deleted: true, id };
  }
}
