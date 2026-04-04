import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../database/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async getUser(userId: number): Promise<User | null> {
    return this.userRepo.findOne({ where: { id: userId } });
  }

  // Multi-user methods (inactive in single_user mode)
  async generateToken(user: User): Promise<string> {
    return this.jwtService.sign({ userId: user.id, email: user.email });
  }
}
