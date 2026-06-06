import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SummaryService } from './summary.service.js';
import { Invoice } from '../invoices/schemas/invoice.schema.js';
import { Customer } from '../customers/schemas/customer.schema.js';

describe('SummaryService', () => {
  let service: SummaryService;
  let invoiceModel: Record<string, jest.Mock>;
  let customerModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    invoiceModel = {
      aggregate: jest.fn(),
    };

    customerModel = {
      countDocuments: jest.fn().mockResolvedValue(61),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        { provide: getModelToken(Invoice.name), useValue: invoiceModel },
        { provide: getModelToken(Customer.name), useValue: customerModel },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
  });

  it('should return summary stats and top customers', async () => {
    invoiceModel.aggregate
      .mockResolvedValueOnce([
        { totalBilled: 5590436.07, totalTax: 539870.55, invoiceCount: 2000 },
      ])
      .mockResolvedValueOnce([
        { name: 'Ramesh Pillai', company: 'Cipla Pharma', revenue: 133213.07 },
        { name: 'Rajesh Kumar', company: 'Dr Reddy Labs', revenue: 130003.3 },
      ]);

    const result = await service.getSummary();

    expect(result.stats.totalBilled).toBe(5590436.07);
    expect(result.stats.totalTax).toBe(539870.55);
    expect(result.stats.invoiceCount).toBe(2000);
    expect(result.stats.customerCount).toBe(61);
    expect(result.topCustomers).toHaveLength(2);
    expect(result.topCustomers[0].name).toBe('Ramesh Pillai');
  });

  it('should handle empty database gracefully', async () => {
    invoiceModel.aggregate
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    customerModel.countDocuments.mockResolvedValue(0);

    const result = await service.getSummary();

    expect(result.stats.totalBilled).toBe(0);
    expect(result.stats.invoiceCount).toBe(0);
    expect(result.stats.customerCount).toBe(0);
    expect(result.topCustomers).toHaveLength(0);
  });
});
