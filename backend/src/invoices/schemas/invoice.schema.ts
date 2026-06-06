import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Customer } from '../../customers/schemas/customer.schema.js';

export type InvoiceDocument = HydratedDocument<Invoice>;

export const INVOICE_STATUSES = [
  'Paid',
  'Unpaid',
  'Overdue',
  'Draft',
  'Sent',
  'Void',
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const TAX_RATES = [0, 3, 5, 18, 28] as const;

@Schema({ timestamps: true })
export class Invoice {
  @Prop({ required: true, unique: true, index: true })
  invoiceId!: string;

  @Prop({ type: Types.ObjectId, ref: Customer.name, required: true, index: true })
  customerId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, enum: TAX_RATES })
  taxRate!: number;

  @Prop({ required: true })
  tax!: number;

  @Prop({ required: true })
  total!: number;

  @Prop({ required: true, type: String, enum: INVOICE_STATUSES })
  status!: InvoiceStatus;

  @Prop({ required: true, index: true })
  issueDate!: Date;

  @Prop({ required: true, index: true })
  dueDate!: Date;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.index({ customerId: 1, status: 1 });
