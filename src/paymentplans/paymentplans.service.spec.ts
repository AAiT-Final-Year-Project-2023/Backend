import { Test, TestingModule } from '@nestjs/testing';
import { PaymentplansService } from './paymentplans.service';

describe('PaymentplansService', () => {
  let service: PaymentplansService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentplansService],
    }).compile();

    service = module.get<PaymentplansService>(PaymentplansService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
