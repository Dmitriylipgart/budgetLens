import { IsOptional, IsString } from 'class-validator';

export class PeriodQueryDto {
  @IsOptional()
  @IsString()
  from?: string; // ISO date YYYY-MM-DD

  @IsOptional()
  @IsString()
  to?: string;
}
