import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { Customer } from './schemas/customer.schema.js';
import { Invoice } from '../invoices/schemas/invoice.schema.js';

describe('CustomersService', () => {
  let service: CustomersService;
  let customerModel: Record<string, jest.Mock>;
  let invoiceModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    customerModel = {
      find: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              { _id: 'c1', name: 'Test User', company: 'Test Co' },
            ]),
          }),
        }),
      }),
      findById: jest.fn(),
    };

    invoiceModel = {
      aggregate: jest.fn().mockResolvedValue([
        {
          totalBilled: 10000,
          totalTax: 1800,
          outstanding: 5000,
          invoiceCount: 10,
          paidCount: 5,
          unpaidCount: 2,
          overdueCount: 1,
          draftCount: 1,
          sentCount: 1,
          voidCount: 0,
        },
      ]),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: getModelToken(Customer.name), useValue: customerModel },
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  describe('findAll', () => {
    it('should return list of customers', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('name', 'Test User');
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException when customer not found', async () => {
      customerModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return customer profile with aggregated stats', async () => {
      customerModel.findById.mockReturnValue({
        lean: jest.fn().mockResolvedValue({
          _id: 'c1',
          name: 'Test User',
          company: 'Test Co',
        }),
      });

      const result = await service.findOne('683ff0a0a0a0a0a0a0a0a0a0');

      expect(result.name).toBe('Test User');
      expect(result.company).toBe('Test Co');
      expect(result.totalBilled).toBe(10000);
      expect(result.invoiceCount).toBe(10);
      expect(result.statusCounts).toHaveProperty('Paid', 5);
      expect(result.statusCounts).toHaveProperty('Unpaid', 2);
    });
  });
});
