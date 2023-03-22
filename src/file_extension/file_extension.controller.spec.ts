import { Test, TestingModule } from '@nestjs/testing';
import { FileExtensionController } from './file_extension.controller';

describe('FileExtensionController', () => {
  let controller: FileExtensionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileExtensionController],
    }).compile();

    controller = module.get<FileExtensionController>(FileExtensionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
