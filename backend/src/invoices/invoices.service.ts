import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice, InvoiceDocument } from './schemas/invoice.schema.js';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from './dto/update-invoice.dto.js';
import { InvoiceQueryDto } from './dto/invoice-query.dto.js';

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
  ) {}

  async findAll(query: InvoiceQueryDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'issueDate',
      sortOrder = 'desc',
      status,
      customer,
      search,
      issueDateFrom,
      issueDateTo,
      dueDateFrom,
      dueDateTo,
      taxRate,
    } = query;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (status) {
      filter.status = status;
    }

    if (taxRate !== undefined) {
      filter.taxRate = taxRate;
    }

    if (issueDateFrom || issueDateTo) {
      filter.issueDate = {};
      if (issueDateFrom) filter.issueDate.$gte = new Date(issueDateFrom);
      if (issueDateTo) filter.issueDate.$lte = new Date(issueDateTo);
    }

    if (dueDateFrom || dueDateTo) {
      filter.dueDate = {};
      if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
      if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
    }

    if (search || customer) {
      const searchTerm = search || customer;
      const escaped = escapeRegex(searchTerm!);
      const matchingCustomers = await this.customerModel
        .find({ name: { $regex: escaped, $options: 'i' } })
        .select('_id')
        .lean();
      const customerIds = matchingCustomers.map((c) => c._id);

      if (search) {
        filter.$or = [
          { invoiceId: { $regex: escapeRegex(search), $options: 'i' } },
          { customerId: { $in: customerIds } },
        ];
      } else {
        filter.customerId = { $in: customerIds };
      }
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [data, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('customerId', 'name company')
        .lean(),
      this.invoiceModel.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(dto: CreateInvoiceDto) {
    const customer = await this.customerModel.findById(dto.customerId);
    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    const invoiceId = await this.generateInvoiceId();
    const tax = Math.round(dto.amount * dto.taxRate) / 100;
    const total = Math.round((dto.amount + tax) * 100) / 100;

    const invoice = new this.invoiceModel({
      invoiceId,
      customerId: new Types.ObjectId(dto.customerId),
      amount: dto.amount,
      taxRate: dto.taxRate,
      tax,
      total,
      status: dto.status,
      issueDate: new Date(dto.issueDate),
      dueDate: new Date(dto.dueDate),
    });
    await invoice.save();

    return this.invoiceModel
      .findById(invoice._id)
      .populate('customerId', 'name company')
      .lean();
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.invoiceModel.findById(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (dto.customerId) {
      const customer = await this.customerModel.findById(dto.customerId);
      if (!customer) {
        throw new BadRequestException('Customer not found');
      }
      invoice.customerId = new Types.ObjectId(dto.customerId);
    }

    if (dto.amount !== undefined) invoice.amount = dto.amount;
    if (dto.taxRate !== undefined) invoice.taxRate = dto.taxRate;
    if (dto.status) invoice.status = dto.status as Invoice['status'];
    if (dto.issueDate) invoice.issueDate = new Date(dto.issueDate);
    if (dto.dueDate) invoice.dueDate = new Date(dto.dueDate);

    if (dto.amount !== undefined || dto.taxRate !== undefined) {
      invoice.tax = Math.round(invoice.amount * invoice.taxRate) / 100;
      invoice.total =
        Math.round((invoice.amount + invoice.tax) * 100) / 100;
    }

    await invoice.save();

    return this.invoiceModel
      .findById(id)
      .populate('customerId', 'name company')
      .lean();
  }

  private async generateInvoiceId(): Promise<string> {
    for (let i = 0; i < 10; i++) {
      const id = `INV-${String(Math.floor(Math.random() * 10_000_000)).padStart(7, '0')}`;
      const exists = await this.invoiceModel.exists({ invoiceId: id });
      if (!exists) return id;
    }
    throw new Error('Failed to generate unique invoice ID');
  }
}
