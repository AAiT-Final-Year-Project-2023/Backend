import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Data } from './data.entity';
import { FindPagination } from 'src/common/interfaces';

@Injectable()
export class DataService {
    constructor(@InjectRepository(Data) private repo: Repository<Data>) {}

    async create(data: Partial<Data>) {
        const newData = this.repo.create(data);
        return this.repo.save(newData);
    }

    async find(page?: number, limit?: number): Promise<FindPagination<Data>> {
        const size = await this.repo.count();
        const query = this.repo.createQueryBuilder('data');

        if (limit) {
            query.take(limit);
            if (page) query.skip((page - 1) * limit);
        }

        const data = await query.getMany();

        return {
            results: data,
            total: size,
        };
    }

    async findById(id: string): Promise<Data> {
        return this.repo.findOne({ where: { id } });
    }

    async update(id: string, attrs: Partial<Data>): Promise<Data> {
        const data = await this.findById(id);
        if (!data)
            throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
        Object.assign(data, attrs);
        return this.repo.save(data);
    }

    async remove(id: string): Promise<Data> {
        const data = await this.findById(id);
        if (!data)
            throw new HttpException('Data not found', HttpStatus.NOT_FOUND);
        return this.repo.remove(data);
    }
}
