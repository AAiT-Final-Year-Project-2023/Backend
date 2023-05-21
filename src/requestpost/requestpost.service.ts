import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestPost } from './requestpost.entity';
import { UpdateRequestPostDto } from './dtos/update_requestpost.dto';
import { CreateRequestPostDto } from './dtos/create_requestpost.dto';
import { FindPagination } from 'src/common/interfaces';
import { DataTypeFilter, SortOrder } from 'src/common/defaults';

@Injectable()
export class RequestpostService {
    constructor(
        @InjectRepository(RequestPost) private repo: Repository<RequestPost>,
    ) {}

    async create(
        requestPost: CreateRequestPostDto,
        userId: string,
    ): Promise<RequestPost> {
        const newRequestPost = this.repo.create({
            user: userId,
            ...requestPost,
        });
        return this.repo.save(newRequestPost);
    }

    async find(
        page?: number,
        limit?: number,
        search?: string,
        filter?: DataTypeFilter,
        sort?: SortOrder,
        mobile?: boolean,
    ): Promise<FindPagination<RequestPost>> {
        const metadata = this.repo.metadata;
        let requestPostColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        requestPostColumns = requestPostColumns.map(
            (column) => `request_post.${column}`,
        );
        const query = this.repo
            .createQueryBuilder('request_post')
            .leftJoinAndSelect('request_post.user', 'user')
            .leftJoinAndSelect('request_post.payment_plan', 'payment_plan')
            .select([
                ...requestPostColumns,
                'payment_plan.id',
                'user.id',
                'payment_plan.title',
                'user.username',
                'user.email',
                'user.image',
            ]);

        if (search && search !== '')
            query
                .where('request_post.title LIKE :searchString', {
                    searchString: `%${search}%`,
                })
                .orWhere('request_post.description LIKE :searchString', {
                    searchString: `%${search}%`,
                });

        if (filter && filter !== DataTypeFilter.ALL)
            query.where('request_post.datatype = :dataType', {
                dataType: filter,
            });

        if (sort) query.addOrderBy('created_at', sort);

        if (mobile)
            query.where(
                'COALESCE(array_length(request_post.labels, 1), 0) = 0',
            );

        if (limit){
            query.take(limit);
            if (page) query.skip((page - 1) * limit);
        }

        const requestPosts = await query.getMany();

        return {
            results: requestPosts,
            total: requestPosts.length,
        };
    }

    async findById(id: string): Promise<RequestPost> {
        const metadata = this.repo.metadata;
        let requestPostColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        requestPostColumns = requestPostColumns.map(
            (column) => `request_post.${column}`,
        );
        return this.repo
            .createQueryBuilder('request_post')
            .leftJoinAndSelect('request_post.user', 'user')
            .leftJoinAndSelect('request_post.payment_plan', 'payment_plan')
            .where('request_post.id = :id', { id })
            .select([
                ...requestPostColumns,
                'payment_plan.id',
                'user.id',
                'payment_plan.title',
                'user.username',
                'user.email',
                'user.image',
            ])
            .getOne();
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
