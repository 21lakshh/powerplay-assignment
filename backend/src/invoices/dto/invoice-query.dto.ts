import { IsOptional, IsString, IsNumber, IsEnum, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { INVOICE_STATUSES } from '../schemas/invoice.schema.js';

export class InvoiceQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  @IsEnum(['amount', 'dueDate', 'issueDate', 'total'])
  sortBy?: string = 'issueDate';

  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @IsOptional()
  @IsString()
  @IsEnum(INVOICE_STATUSES)
  status?: string;

  @IsOptional()
  @IsString()
  customer?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  issueDateFrom?: string;

  @IsOptional()
  @IsString()
  issueDateTo?: string;

  @IsOptional()
  @IsString()
  dueDateFrom?: string;

  @IsOptional()
  @IsString()
  dueDateTo?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  taxRate?: number;
}
