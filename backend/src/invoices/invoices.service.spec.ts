import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from './invoices.service.js';
import { Invoice } from './schemas/invoice.schema.js';
import { Customer } from '../customers/schemas/customer.schema.js';

describe('InvoicesService', () => {
  let service: InvoicesService;
  let invoiceModel: Record<string, jest.Mock>;
  let customerModel: Record<string, jest.Mock>;

  const mockInvoice = {
    _id: 'inv-id-1',
    invoiceId: 'INV-0000001',
    customerId: 'cust-id-1',
    amount: 1000,
    taxRate: 18,
    tax: 180,
    total: 1180,
    status: 'Draft',
    issueDate: new Date('2025-01-01'),
    dueDate: new Date('2025-07-01'),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const chainable = {
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([mockInvoice]),
      select: jest.fn().mockReturnThis(),
    };

    invoiceModel = {
      find: jest.fn().mockReturnValue(chainable),
      countDocuments: jest.fn().mockResolvedValue(1),
      findById: jest.fn(),
      exists: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
    };

    customerModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: getModelToken(Customer.name), useValue: customerModel },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
  });

  describe('findAll', () => {
    it('should return paginated invoices with defaults', async () => {
      const result = await service.findAll({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should apply status filter', async () => {
      await service.findAll({ status: 'Paid' });

      const findCall = invoiceModel.find.mock.calls[0][0];
      expect(findCall.status).toBe('Paid');
    });

    it('should apply tax rate filter', async () => {
      await service.findAll({ taxRate: 18 });

      const findCall = invoiceModel.find.mock.calls[0][0];
      expect(findCall.taxRate).toBe(18);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException when invoice not found', async () => {
      invoiceModel.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { amount: 500 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should recalculate tax and total when amount changes', async () => {
      const saveable = {
        ...mockInvoice,
        save: jest.fn().mockResolvedValue(undefined),
      };
      invoiceModel.findById
        .mockResolvedValueOnce(saveable)
        .mockReturnValueOnce({
          populate: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(saveable),
          }),
        });

      await service.update('inv-id-1', { amount: 2000 });

      expect(saveable.amount).toBe(2000);
      expect(saveable.tax).toBe(Math.round(2000 * 18) / 100);
      expect(saveable.save).toHaveBeenCalled();
    });
  });
});
