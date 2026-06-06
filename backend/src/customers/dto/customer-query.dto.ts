import { IsOptional, IsString } from 'class-validator';

export class CustomerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;
}
