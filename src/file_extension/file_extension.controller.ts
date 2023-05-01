import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    ParseUUIDPipe,
} from '@nestjs/common';
import { FileExtension } from './file_extension.entity';
import { FileExtensionService } from './file_extension.service';
import { CreateFileExtensionDto } from './dtos/create_file_extension.dto';
import { UpdateFileExtensionDto } from './dtos/update_file_extention.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/common/defaults';

@Controller('file-extension')
export class FileExtensionController {
    constructor(private fileExtensionService: FileExtensionService) {}

    @Roles(UserRole.ADMIN)
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

    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateFileExtensionDto,
    ): Promise<FileExtension> {
        return this.fileExtensionService.update(id, body);
    }

    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<FileExtension> {
        return this.fileExtensionService.remove(id);
    }
}
