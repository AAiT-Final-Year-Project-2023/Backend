import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestPost } from './requestpost.entity';
import { UpdateRequestPostDto } from './dtos/update_requestpost.dto';
import { CreateRequestPostDto } from './dtos/create_requestpost.dto';
import { FindPagination } from 'src/common/interfaces';
import { DataTypeFilter, DatasetAccess, SortOrder } from 'src/common/defaults';
import { User } from 'src/user/user.entity';

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
            .leftJoinAndSelect('request_post.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('request_post.downvoted_by', 'downvoted_user')
            .select([
                ...requestPostColumns,
                'payment_plan.id',
                'user.id',
                'payment_plan.title',
                'user.username',
                'user.email',
                'user.image',
                'upvoted_user.id',
                'downvoted_user.id',
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

        if (limit) {
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
            .leftJoinAndSelect('request_post.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('request_post.downvoted_by', 'downvoted_user')
            .where('request_post.id = :id', { id })
            .select([
                ...requestPostColumns,
                'payment_plan.id',
                'user.id',
                'payment_plan.title',
                'user.username',
                'user.email',
                'user.image',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .getOne();
    }

    async update(
        id: string,
        attrs: Partial<RequestPost>,
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

    async close(id: string) {
        const requestPost = await this.findById(id);
        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );

        return await this.update(id, {
            closed: true,
        });
    }

    async makePrivate(id: string) {
        const requestPost = await this.findById(id);
        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );

        return await this.update(id, {
            access: DatasetAccess.PRIVATE,
        });
    }

    async makePublic(id: string) {
        const requestPost = await this.findById(id);
        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );

        return await this.update(id, {
            access: DatasetAccess.PUBLIC,
        });
    }

    async upvote(id: string, user: User) {
        const metadata = this.repo.metadata;
        let requestPostColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        requestPostColumns = requestPostColumns.map(
            (column) => `request_post.${column}`,
        );
        let requestPost = await this.repo
            .createQueryBuilder('request_post')
            .leftJoinAndSelect('request_post.user', 'user')
            .leftJoinAndSelect('request_post.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('request_post.downvoted_by', 'downvoted_user')
            .where('request_post.id = :id', { id })
            .select([
                ...requestPostColumns,
                'user.id',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .getOne();

        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );

        if (!requestPost.closed)
            throw new HttpException(
                'A request post must be closed to be upvoted',
                HttpStatus.BAD_REQUEST,
            );

        if (requestPost.access === DatasetAccess.PRIVATE)
            throw new HttpException(
                'Cannot upvote a private request post',
                HttpStatus.BAD_REQUEST,
            );

        // check if already upvoted
        const arr = requestPost.upvoted_by.filter(
            (upvoted_user) => user.id === upvoted_user.id,
        );
        const alreadyUpvoted: boolean = arr.length > 0;

        // clear the user from the upvoted_by list
        requestPost.upvoted_by = requestPost.upvoted_by.filter(
            (upvoted_user) => user.id !== upvoted_user.id,
        );

        // if the user hasn't liked the request_post add them to the list
        if (!alreadyUpvoted) requestPost.upvoted_by.push(user);

        // if the user has disliked the request_post, remove them from the downvoted_by list
        requestPost.downvoted_by = requestPost.downvoted_by.filter(
            (downvoted_user) => user.id !== downvoted_user.id,
        );

        await this.repo.save(requestPost);
        return this.repo
            .createQueryBuilder('request_post')
            .leftJoinAndSelect('request_post.user', 'user')
            .leftJoinAndSelect('request_post.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('request_post.downvoted_by', 'downvoted_user')
            .where('request_post.id = :id', { id })
            .select([
                'request_post.id',
                'user.id',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .getOne();
    }

    async downvote(id: string, user: User) {
        const metadata = this.repo.metadata;
        let requestPostColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        requestPostColumns = requestPostColumns.map(
            (column) => `request_post.${column}`,
        );
        let requestPost = await this.repo
            .createQueryBuilder('request_post')
            .leftJoinAndSelect('request_post.user', 'user')
            .leftJoinAndSelect('request_post.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('request_post.downvoted_by', 'downvoted_user')
            .where('request_post.id = :id', { id })
            .select([
                ...requestPostColumns,
                'user.id',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .getOne();
        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );

        if (!requestPost.closed)
            throw new HttpException(
                'A request post must be closed to be downvoted',
                HttpStatus.BAD_REQUEST,
            );

        if (requestPost.access === DatasetAccess.PRIVATE)
            throw new HttpException(
                'Cannot downvote a private request post',
                HttpStatus.BAD_REQUEST,
            );

        // check if already downvoted
        const arr = requestPost.downvoted_by.filter(
            (downvoted_user) => user.id === downvoted_user.id,
        );
        const alreadyDownvoted: boolean = arr.length > 0;

        // clear the user from the upvoted_by list
        requestPost.downvoted_by = requestPost.downvoted_by.filter(
            (downvoted_user) => user.id !== downvoted_user.id,
        );

        // if the user hasn't disliked the request_post add them to the list
        if (!alreadyDownvoted) requestPost.downvoted_by.push(user);

        // if the user has liked the request_post, remove them from the upvoted_by list
        requestPost.upvoted_by = requestPost.upvoted_by.filter(
            (upvoted_user) => user.id !== upvoted_user.id,
        );
        await this.repo.save(requestPost);
        return this.repo
            .createQueryBuilder('request_post')
            .leftJoinAndSelect('request_post.user', 'user')
            .leftJoinAndSelect('request_post.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('request_post.downvoted_by', 'downvoted_user')
            .where('request_post.id = :id', { id })
            .select([
                'request_post.id',
                'user.id',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .getOne();
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
