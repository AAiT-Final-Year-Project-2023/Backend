import { Test, TestingModule } from '@nestjs/testing';
import { BankinformationController } from './bankinformation.controller';

describe('BankinformationController', () => {
    let controller: BankinformationController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [BankinformationController],
        }).compile();

        controller = module.get<BankinformationController>(
            BankinformationController,
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
