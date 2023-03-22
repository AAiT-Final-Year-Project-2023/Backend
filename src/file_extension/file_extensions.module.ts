import { Module } from '@nestjs/common';
import { FileExtensionsService } from './file_extensions.service';
import { FileExtensionController } from './file_extension.controller';

@Module({
  providers: [FileExtensionsService],
  controllers: [FileExtensionController]
})
export class FileExtensionsModule {}
