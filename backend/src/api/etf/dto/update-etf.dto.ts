import { PartialType } from '@nestjs/mapped-types';
import { CreateEtfDto } from './create-etf.dto';

export class UpdateEtfDto extends PartialType(CreateEtfDto) {}


