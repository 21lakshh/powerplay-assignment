import {
  IsString,
  IsNumber,
  IsEnum,
  IsDateString,
  IsPositive,
  IsMongoId,
} from 'class-validator';
import { INVOICE_STATUSES, TAX_RATES } from '../schemas/invoice.schema.js';

export class CreateInvoiceDto {
  @IsMongoId()
  customerId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsNumber()
  @IsEnum(TAX_RATES)
  taxRate!: number;

  @IsString()
  @IsEnum(INVOICE_STATUSES)
  status!: string;

  @IsDateString()
  issueDate!: string;

  @IsDateString()
  dueDate!: string;
}
