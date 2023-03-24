import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindPagination } from 'src/common/interfaces';
import { Repository } from 'typeorm';
import { Dataset } from './dataset.entity';
import { CreateDatasetDto } from './dtos/create_dataset.dto';
import { UpdateDatasetDto } from './dtos/update_dataset.dto';

@Injectable()
export class DatasetService {
    constructor(@InjectRepository(Dataset) private repo: Repository<Dataset>) {}

    async create(dataset: CreateDatasetDto): Promise<Dataset> {
        // attach a user and payment_plan
        const newDataset = await this.repo.create(dataset);
        return this.repo.save(newDataset);
    }

    async find(
        page?: number,
        limit?: number,
    ): Promise<FindPagination<Dataset>> {
        const size = this.repo.count();
        const datasets = this.repo.find({
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            results: datasets,
            total: size,
        };
    }

    async findById(id: number): Promise<Dataset> {
        return this.repo.findOne({ where: { id } });
    }

    async update(
        id: number,
        attrs: Partial<UpdateDatasetDto>,
    ): Promise<Dataset> {
        const dataset = await this.findById(id);
        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        Object.assign(dataset, attrs);
        return this.repo.save(dataset);
    }

    async remove(id: number): Promise<Dataset> {
        const dataset = await this.findById(id);
        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        return this.repo.remove(dataset);
    }
}
