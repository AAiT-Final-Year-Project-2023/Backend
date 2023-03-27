import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Delete,
    ParseUUIDPipe,
} from '@nestjs/common';
import { FileExtension } from './file_extension.entity';
import { FileExtensionService } from './file_extension.service';
import { CreateFileExtensionDto } from './dtos/create_file_extension.dto';
import { UpdateFileExtensionDto } from './dtos/update_file_extention.dto';

@Controller('file-extension')
export class FileExtensionController {
    constructor(private fileExtensionService: FileExtensionService) {}

    @Post()
    async create(@Body() body: CreateFileExtensionDto): Promise<FileExtension> {
        return this.fileExtensionService.create(body);
    }

    @Get()
    async find(): Promise<FileExtension[]> {
        return this.fileExtensionService.find();
    }

    @Get(':id')
    async findById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<FileExtension> {
        return this.fileExtensionService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateFileExtensionDto,
    ): Promise<FileExtension> {
        return this.fileExtensionService.update(id, body);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<FileExtension> {
        return this.fileExtensionService.remove(id);
    }
}
