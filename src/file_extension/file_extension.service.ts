import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileExtension } from './file_extension.entity';
import { CreateFileExtensionDto } from './dtos/create_file_extension.dto';

@Injectable()
export class FileExtensionService {
    constructor(
        @InjectRepository(FileExtension)
        private repo: Repository<FileExtension>,
    ) {}

    async create(
        fileExtension: CreateFileExtensionDto,
    ): Promise<FileExtension> {
        const newFileExtension = await this.repo.create(fileExtension);
        return this.repo.save(newFileExtension);
    }

    async find(): Promise<FileExtension[]> {
        return this.repo.find();
    }

    async findOne(id: number): Promise<FileExtension> {
        return this.repo.findOne({ where: { id } });
    }

    async update(
        id: number,
        attrs: Partial<FileExtension>,
    ): Promise<FileExtension> {
        const fileExtension = await this.findOne(id);
        if (!fileExtension)
            throw new HttpException(
                'File Extension not found',
                HttpStatus.NOT_FOUND,
            );
        Object.assign(fileExtension, attrs);
        return this.repo.save(fileExtension);
    }

    async remove(id: number): Promise<FileExtension> {
        const fileExtension = await this.findOne(id);
        if (!fileExtension)
            throw new HttpException(
                'File Extension not found',
                HttpStatus.NOT_FOUND,
            );
        return this.repo.remove(fileExtension);
    }
}
