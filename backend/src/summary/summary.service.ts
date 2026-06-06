import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../invoices/schemas/invoice.schema.js';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema.js';

@Injectable()
export class SummaryService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async getSummary() {
    const [statsAgg, customerCount, topCustomersAgg, statusAgg, monthlyAgg] =
      await Promise.all([
        this.invoiceModel.aggregate([
          {
            $group: {
              _id: null,
              totalBilled: { $sum: '$total' },
              totalTax: { $sum: '$tax' },
              invoiceCount: { $sum: 1 },
            },
          },
        ]),
        this.customerModel.countDocuments(),
        this.invoiceModel.aggregate([
          {
            $group: {
              _id: '$customerId',
              revenue: { $sum: '$total' },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'customers',
              localField: '_id',
              foreignField: '_id',
              as: 'customer',
            },
          },
          { $unwind: '$customer' },
          {
            $project: {
              _id: 0,
              name: '$customer.name',
              company: '$customer.company',
              revenue: { $round: ['$revenue', 2] },
            },
          },
        ]),
        this.invoiceModel.aggregate([
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              total: { $sum: '$total' },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: 1,
              total: { $round: ['$total', 2] },
            },
          },
        ]),
        this.invoiceModel.aggregate([
          {
            $group: {
              _id: {
                year: { $year: '$issueDate' },
                month: { $month: '$issueDate' },
              },
              revenue: { $sum: '$total' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
          {
            $project: {
              _id: 0,
              year: '$_id.year',
              month: '$_id.month',
              revenue: { $round: ['$revenue', 2] },
              count: 1,
            },
          },
        ]),
      ]);

    const stats = statsAgg[0] || {
      totalBilled: 0,
      totalTax: 0,
      invoiceCount: 0,
    };

    return {
      stats: {
        totalBilled: Math.round(stats.totalBilled * 100) / 100,
        totalTax: Math.round(stats.totalTax * 100) / 100,
        invoiceCount: stats.invoiceCount,
        customerCount,
      },
      topCustomers: topCustomersAgg,
      statusBreakdown: statusAgg,
      monthlyRevenue: monthlyAgg,
    };
  }
}
