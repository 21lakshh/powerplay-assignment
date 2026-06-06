import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema.js';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema.js';
import * as fs from 'fs';
import * as path from 'path';

interface SeedRecord {
  invoiceId: string;
  customer: string;
  company: string;
  amount: number;
  taxRate: number;
  tax: number;
  total: number;
  status: string;
  issueDate: string;
  dueDate: string;
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async onApplicationBootstrap() {
    await this.seed();
  }

  async seed() {
    const customerCount = await this.customerModel.countDocuments();
    if (customerCount > 0) {
      this.logger.log(
        `Database already seeded (${customerCount} customers found). Skipping.`,
      );
      return;
    }

    this.logger.log('Seeding database...');

    const candidates = [
      path.resolve(process.cwd(), 'seed-data.json'),
      path.resolve(process.cwd(), '../seed-data.json'),
    ];
    const seedPath = candidates.find((p) => fs.existsSync(p));
    if (!seedPath) {
      this.logger.error(
        `Seed file not found. Searched: ${candidates.join(', ')}`,
      );
      return;
    }

    const raw = fs.readFileSync(seedPath, 'utf-8');
    const records: SeedRecord[] = JSON.parse(raw);

    const customerMap = new Map<string, string>();
    for (const record of records) {
      if (!customerMap.has(record.customer)) {
        customerMap.set(record.customer, record.company);
      }
    }

    const customerDocs = Array.from(customerMap.entries()).map(
      ([name, company]) => ({ name, company }),
    );

    const insertedCustomers =
      await this.customerModel.insertMany(customerDocs);
    this.logger.log(`Seeded ${insertedCustomers.length} customers`);

    const nameToId = new Map<string, typeof insertedCustomers[0]['_id']>();
    for (const cust of insertedCustomers) {
      nameToId.set(cust.name, cust._id);
    }

    const invoiceDocs = records.map((record) => ({
      invoiceId: record.invoiceId,
      customerId: nameToId.get(record.customer)!,
      amount: record.amount,
      taxRate: record.taxRate,
      tax: record.tax,
      total: record.total,
      status: record.status,
      issueDate: new Date(record.issueDate),
      dueDate: new Date(record.dueDate),
    }));

    await this.invoiceModel.insertMany(invoiceDocs);
    this.logger.log(`Seeded ${invoiceDocs.length} invoices`);
  }
}
