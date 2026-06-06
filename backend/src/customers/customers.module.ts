import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomersController } from './customers.controller.js';
import { CustomersService } from './customers.service.js';
import { Customer, CustomerSchema } from './schemas/customer.schema.js';
import {
  Invoice,
  InvoiceSchema,
} from '../invoices/schemas/invoice.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Invoice.name, schema: InvoiceSchema },
    ]),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
