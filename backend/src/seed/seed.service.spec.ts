import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SeedService } from './seed.service.js';
import { Customer } from '../customers/schemas/customer.schema.js';
import { Invoice } from '../invoices/schemas/invoice.schema.js';

describe('SeedService', () => {
  let service: SeedService;
  let customerModel: Record<string, jest.Mock>;
  let invoiceModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    customerModel = {
      countDocuments: jest.fn(),
      insertMany: jest.fn(),
    };
    invoiceModel = {
      insertMany: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: getModelToken(Customer.name), useValue: customerModel },
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should skip seeding when customers already exist', async () => {
    customerModel.countDocuments.mockResolvedValue(61);

    await service.seed();

    expect(customerModel.countDocuments).toHaveBeenCalled();
    expect(customerModel.insertMany).not.toHaveBeenCalled();
    expect(invoiceModel.insertMany).not.toHaveBeenCalled();
  });

  it('should seed when database is empty', async () => {
    customerModel.countDocuments.mockResolvedValue(0);
    customerModel.insertMany.mockResolvedValue(
      [{ _id: 'id1', name: 'Test Customer' }],
    );
    invoiceModel.insertMany.mockResolvedValue([]);

    await service.seed();

    expect(customerModel.countDocuments).toHaveBeenCalled();
    expect(customerModel.insertMany).toHaveBeenCalled();
    expect(invoiceModel.insertMany).toHaveBeenCalled();

    const customerDocs = customerModel.insertMany.mock.calls[0][0];
    expect(customerDocs.length).toBeGreaterThan(0);
    expect(customerDocs[0]).toHaveProperty('name');
    expect(customerDocs[0]).toHaveProperty('company');
  });
});
