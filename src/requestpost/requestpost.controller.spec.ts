import { Test, TestingModule } from '@nestjs/testing';
import { RequestpostController } from './requestpost.controller';

describe('RequestpostController', () => {
    let controller: RequestpostController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [RequestpostController],
        }).compile();

        controller = module.get<RequestpostController>(RequestpostController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
