import { Test, TestingModule } from '@nestjs/testing';
import { FileExtensionsService } from './file_extension.service';

describe('FileExtensionsService', () => {
    let service: FileExtensionsService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FileExtensionsService],
        }).compile();

        service = module.get<FileExtensionsService>(FileExtensionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
