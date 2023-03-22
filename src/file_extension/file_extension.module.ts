import { Module } from '@nestjs/common';
import { FileExtensionsService } from './file_extension.service';
import { FileExtensionController } from './file_extension.controller';

@Module({
    providers: [FileExtensionsService],
    controllers: [FileExtensionController],
    exports: [FileExtensionsService]
})
export class FileExtensionsModule {}
