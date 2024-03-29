import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileExtension } from './file_extension.entity';
import { FileExtensionService } from './file_extension.service';
import { FileExtensionController } from './file_extension.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FileExtension])],
    providers: [FileExtensionService],
    controllers: [FileExtensionController],
    exports: [FileExtensionService],
})
export class FileExtensionModule {}
