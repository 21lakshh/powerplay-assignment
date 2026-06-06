import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service.js';
import { Customer, CustomerSchema } from '../customers/schemas/customer.schema.js';
import { Invoice, InvoiceSchema } from '../invoices/schemas/invoice.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
