import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateMerchantDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  categoryGroup?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class MergeMerchantDto {
  @IsNumber()
  sourceId: number;

  @IsNumber()
  targetId: number;
}
