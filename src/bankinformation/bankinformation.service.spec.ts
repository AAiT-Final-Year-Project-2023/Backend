import { Test, TestingModule } from '@nestjs/testing';
import { BankinformationService } from './bankinformation.service';

describe('BankinformationService', () => {
    let service: BankinformationService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BankinformationService],
        }).compile();

        service = module.get<BankinformationService>(BankinformationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
