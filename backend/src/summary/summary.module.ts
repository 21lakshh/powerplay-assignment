import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SummaryController } from './summary.controller.js';
import { SummaryService } from './summary.service.js';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema.js';
import {
  Customer,
  CustomerSchema,
} from '../customers/schemas/customer.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Customer.name, schema: CustomerSchema },
    ]),
  ],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
