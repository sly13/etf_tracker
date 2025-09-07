import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class UpdateApplicationDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  displayName?: string;

  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
