import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestPost } from './requestpost.entity';
import { UpdateRequestPostDto } from './dtos/update_requestpost.dto';
import { CreateRequestPostDto } from './dtos/create_requestpost.dto';
import { FindPagination } from 'src/common/interfaces';

@Injectable()
export class RequestpostService {
    constructor(
        @InjectRepository(RequestPost) private repo: Repository<RequestPost>,
    ) {}

    async create(requestPost: CreateRequestPostDto): Promise<RequestPost> {
        // attach a user and payment_plan
        const newRequestPost = await this.repo.create(requestPost);
        return this.repo.save(newRequestPost);
    }

    async find(
        page?: number,
        limit?: number,
    ): Promise<FindPagination<RequestPost>> {
        const size = this.repo.count();
        const requestPosts = this.repo.find({
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            results: requestPosts,
            total: size,
        };
    }

    async findById(id: string): Promise<RequestPost> {
        return this.repo.findOne({ where: { id } });
    }

    async update(
        id: string,
        attrs: Partial<UpdateRequestPostDto>,
    ): Promise<RequestPost> {
        const requestPost = await this.findById(id);
        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );
        Object.assign(requestPost, attrs);
        return this.repo.save(requestPost);
    }

    async remove(id: string): Promise<RequestPost> {
        const requestPost = await this.findById(id);
        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );
        return this.repo.remove(requestPost);
    }
}
