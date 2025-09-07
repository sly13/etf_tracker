import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateEtfDto {
  @IsString()
  symbol: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  assetClass: string;

  @IsNumber()
  expenseRatio: number;

  @IsOptional()
  @IsNumber()
  aum?: number;

  @IsOptional()
  @IsDateString()
  inceptionDate?: string;
}


