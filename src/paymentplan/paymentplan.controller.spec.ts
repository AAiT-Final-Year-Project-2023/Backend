import { Test, TestingModule } from '@nestjs/testing';
import { PaymentplanController } from './paymentplan.controller';

describe('PaymentplanController', () => {
    let controller: PaymentplanController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PaymentplanController],
        }).compile();

        controller = module.get<PaymentplanController>(PaymentplanController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
