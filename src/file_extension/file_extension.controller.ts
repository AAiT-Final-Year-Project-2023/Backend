import { Controller, Post, Body } from '@nestjs/common';
import { CreateFileExtensionDto } from './dtos/create_file_extension.dto';

@Controller('file-extension')
export class FileExtensionController {
    @Post()
    async createFileExtension(@Body() body: CreateFileExtensionDto) {
    }
}
