import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema.js';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema.js';

@Injectable()
export class CustomersService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
  ) {}

  async findAll() {
    return this.customerModel.find().select('name company').sort({ name: 1 }).lean();
  }

  async findOne(id: string) {
    const customer = await this.customerModel.findById(id).lean();
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const objectId = new Types.ObjectId(id);

    const [aggregation, invoices] = await Promise.all([
      this.invoiceModel.aggregate([
        { $match: { customerId: objectId } },
        {
          $group: {
            _id: null,
            totalBilled: { $sum: '$total' },
            totalTax: { $sum: '$tax' },
            outstanding: {
              $sum: {
                $cond: [
                  { $in: ['$status', ['Unpaid', 'Overdue', 'Sent']] },
                  '$total',
                  0,
                ],
              },
            },
            invoiceCount: { $sum: 1 },
            paidCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Paid'] }, 1, 0] },
            },
            unpaidCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Unpaid'] }, 1, 0] },
            },
            overdueCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Overdue'] }, 1, 0] },
            },
            draftCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Draft'] }, 1, 0] },
            },
            sentCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Sent'] }, 1, 0] },
            },
            voidCount: {
              $sum: { $cond: [{ $eq: ['$status', 'Void'] }, 1, 0] },
            },
          },
        },
      ]),
      this.invoiceModel
        .find({ customerId: objectId })
        .sort({ issueDate: -1 })
        .lean(),
    ]);

    const stats = aggregation[0] || {
      totalBilled: 0,
      totalTax: 0,
      outstanding: 0,
      invoiceCount: 0,
      paidCount: 0,
      unpaidCount: 0,
      overdueCount: 0,
      draftCount: 0,
      sentCount: 0,
      voidCount: 0,
    };

    return {
      _id: customer._id,
      name: customer.name,
      company: customer.company,
      totalBilled: Math.round(stats.totalBilled * 100) / 100,
      totalTax: Math.round(stats.totalTax * 100) / 100,
      outstanding: Math.round(stats.outstanding * 100) / 100,
      invoiceCount: stats.invoiceCount,
      statusCounts: {
        Paid: stats.paidCount,
        Unpaid: stats.unpaidCount,
        Overdue: stats.overdueCount,
        Draft: stats.draftCount,
        Sent: stats.sentCount,
        Void: stats.voidCount,
      },
      invoices,
    };
  }
}
