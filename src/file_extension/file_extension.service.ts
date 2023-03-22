import { Injectable } from '@nestjs/common';
import { DataType } from 'src/common/defaults';
import { FileExtension } from './file_extension.entity';

@Injectable()
export class FileExtensionsService {
    async getFileExtensions(): Promise<FileExtension[]> {
        const fakeList: FileExtension[] = [
            {
                id: 1,
                data_type: DataType.IMAGE,
                extension: 'jpg',
            },
            {
                id: 2,
                data_type: DataType.VIDEO,
                extension: 'mp4',
            },
            {
                id: 3,
                data_type: DataType.IMAGE,
                extension: 'png',
            },
            {
                id: 4,
                data_type: DataType.TEXT,
                extension: 'txt',
            },
        ];
        return Promise.resolve(fakeList);
    }

    async getFileExtension(id: number): Promise<FileExtension> {
        return null;
    }
}
