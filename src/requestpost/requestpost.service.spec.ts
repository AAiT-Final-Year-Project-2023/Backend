import { Test, TestingModule } from '@nestjs/testing';
import { RequestpostService } from './requestpost.service';

describe('RequestpostService', () => {
    let service: RequestpostService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [RequestpostService],
        }).compile();

        service = module.get<RequestpostService>(RequestpostService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
