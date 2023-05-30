import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestPost } from './requestpost.entity';
import { FindPagination } from 'src/common/interfaces';
import {
    DataTypeFilter,
    DatasetAccess,
    SortOrder,
    FilterContributionByStatus,
    ContributionStatus,
} from 'src/common/defaults';
import { User } from 'src/user/user.entity';
import { Contribution } from 'src/contribution/contribution.entity';

@Injectable()
export class RequestpostService {
    constructor(
        @InjectRepository(RequestPost) private repo: Repository<RequestPost>,
    ) {}

    async create(
        requestPost: Partial<RequestPost>,
        user: User,
    ): Promise<RequestPost> {
        const metadata = this.repo.metadata;
        let requestPostColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        requestPostColumns = requestPostColumns.map(
            (column) => `request_post.${column}`,
        );

        const newRequestPost = this.repo.create({
            ...requestPost,
            user,
        });

        const query = this.repo
            .createQueryBuilder('request_post')
            .insert()
            .values(newRequestPost)
            .returning(['request_post.id']);
        const result = await query.execute();
        const insertedRowId = result.identifiers[0].id;

        return await this.findById(insertedRowId);
    }

    async find(
        page?: number,
        limit?: number,
        search?: string,
        filter?: DataTypeFilter,
        sortByDate?: SortOrder,
        sortByUpvotes?: SortOrder,
        sortByDownvotes?: SortOrder,
        userId?: string,
        mobile?: boolean,
        closed?: boolean,
    ): Promise<FindPagination<RequestPost>> {
        const metadata = this.repo.metadata;
        let requestPostColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        requestPostColumns = requestPostColumns.map(
            (column) => `request_post.${column}`,
        );
        const upvotesSubquery = this.repo
            .createQueryBuilder('request_post')
            .leftJoin('request_post.upvoted_by', 'upvoted_user')
            .select('request_post.id, COUNT(upvoted_user.id) as upvotes')
            .groupBy('request_post.id');

        const downvotesSubquery = this.repo
            .createQueryBuilder('request_post')
            .leftJoin('request_post.downvoted_by', 'downvoted_user')
            .select('request_post.id, COUNT(downvoted_user.id) as downvotes')
            .groupBy('request_post.id');

        const query = this.repo
            .createQueryBuilder('request_post')
            .leftJoinAndSelect('request_post.user', 'user')
            .leftJoinAndSelect('request_post.payment_plan', 'payment_plan')
            .leftJoinAndSelect('request_post.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('request_post.downvoted_by', 'downvoted_user')
            .leftJoin('request_post.contributions', 'contribution')
            .leftJoin('contribution.data', 'data')
            .select([
                ...requestPostColumns,
                'user.id',
                'user.username',
                'user.email',
                'user.image',
                'payment_plan.id',
                'payment_plan.title',
                'payment_plan.disk_size',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .addSelect('COALESCE(SUM(data.size), 0)', 'used_disk_space')
            .addSelect('upvotes.upvotes', 'upvotes')
            .addSelect('downvotes.downvotes', 'downvotes')
            .leftJoin(
                `(${upvotesSubquery.getQuery()})`,
                'upvotes',
                'upvotes.id = request_post.id',
            )
            .leftJoin(
                `(${downvotesSubquery.getQuery()})`,
                'downvotes',
                'downvotes.id = request_post.id',
            )
            .addGroupBy(
                [
                    ...requestPostColumns,
                    'user.id',
                    'user.username',
                    'user.email',
                    'user.image',
                    'payment_plan.id',
                    'payment_plan.title',
                    'upvoted_user.id',
                    'downvoted_user.id',
                    'upvotes.upvotes',
                    'downvotes.downvotes',
                ].join(', '),
            );

        if (search && search !== '')
            query
                .where('LOWER(request_post.title) LIKE LOWER(:searchString)', {
                    searchString: `%${search.trim()}%`,
                })
                .orWhere(
                    'LOWER(request_post.description) LIKE LOWER(:searchString)',
                    {
                        searchString: `%${search.trim()}%`,
                    },
                );

        if (filter && filter !== DataTypeFilter.ALL)
            query.where('request_post.datatype = :dataType', {
                dataType: filter,
            });

        if (userId) query.where('user.id = :userId', { userId });
        else
            query.where('request_post.access = :access', {
                access: DatasetAccess.PUBLIC,
            });

        if (closed) query.where('request_post.closed = :closed', { closed });

        if (sortByDate) query.addOrderBy('request_post.created_at', sortByDate);
        if (sortByUpvotes) query.addOrderBy('upvotes', sortByUpvotes);
        if (sortByDownvotes) query.addOrderBy('downvotes', sortByDownvotes);

        if (mobile)
            query.where(
                'COALESCE(array_length(request_post.labels, 1), 0) = 0',
            );

        const count = await query.getCount();

        if (limit) {
            query.take(limit);
            if (page) query.skip((page - 1) * limit);
        }

        const requestPosts = await query.getMany();

        return {
            results: requestPosts,
            total: count,
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
                'user.id',
                'user.username',
                'user.email',
                'user.image',
                'payment_plan.id',
                'payment_plan.title',
                'payment_plan.disk_size',
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
        return await this.repo.save(requestPost);
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
            access: DatasetAccess.PRIVATE,
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

    async upvote(id: string, user: User): Promise<RequestPost> {
        const metadata = this.repo.metadata;
        let requestPostColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        requestPostColumns = requestPostColumns.map(
            (column) => `request_post.${column}`,
        );
        const requestPost = await this.repo
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

        const arr = requestPost.upvoted_by.filter(
            (upvoted_user) => user.id === upvoted_user.id,
        );
        const alreadyUpvoted: boolean = arr.length > 0;

        requestPost.upvoted_by = requestPost.upvoted_by.filter(
            (upvoted_user) => user.id !== upvoted_user.id,
        );

        if (!alreadyUpvoted) requestPost.upvoted_by.push(user);

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

    async downvote(id: string, user: User): Promise<RequestPost> {
        const metadata = this.repo.metadata;
        let requestPostColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        requestPostColumns = requestPostColumns.map(
            (column) => `request_post.${column}`,
        );
        const requestPost = await this.repo
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

        const arr = requestPost.downvoted_by.filter(
            (downvoted_user) => user.id === downvoted_user.id,
        );
        const alreadyDownvoted: boolean = arr.length > 0;

        requestPost.downvoted_by = requestPost.downvoted_by.filter(
            (downvoted_user) => user.id !== downvoted_user.id,
        );

        if (!alreadyDownvoted) requestPost.downvoted_by.push(user);

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

    async diskUsage(
        id: string,
        status?: FilterContributionByStatus,
    ): Promise<{ used: number; total: number }> {
        const disk_size_query = this.repo
            .createQueryBuilder('request_post')
            .select('payment_plan.disk_size', 'disk_size')
            .leftJoin('request_post.payment_plan', 'payment_plan')
            .where('request_post.id = :id', { id })
            .groupBy('request_post.id, payment_plan.disk_size');

        const { disk_size } = await disk_size_query.getRawOne();

        const query = this.repo
            .createQueryBuilder('request_post')
            .select('COALESCE(SUM(data.size), 0)', 'sum')
            .addSelect('payment_plan.disk_size', 'disk_size')
            .leftJoin('request_post.contributions', 'contribution')
            .leftJoin('contribution.data', 'data')
            .leftJoin('request_post.payment_plan', 'payment_plan')
            .where('request_post.id = :id', { id })
            .groupBy('request_post.id, payment_plan.disk_size');

        if (status && status !== FilterContributionByStatus.ALL) {
            query.andWhere('contribution.status = :status', { status });
        }

        const result = await query.getRawOne();
        let used = undefined;
        if (result) {
            const { sum } = result;
            used = sum;
        }

        const data = {
            used: parseInt(used) || 0,
            total: parseInt(disk_size) || 0,
        };

        return data;
    }

    async requestPostContributionsCount(
        id: string,
        status?: FilterContributionByStatus,
    ): Promise<number> {
        const query = this.repo
            .createQueryBuilder('request_post')
            .select('COUNT(contribution.id)', 'count')
            .leftJoin('request_post.contributions', 'contribution')
            .where('request_post.id = :id', { id })
            .groupBy('request_post.id');

        if (status && status !== FilterContributionByStatus.ALL) {
            query.andWhere('contribution.status = :status', { status });
        }

        const result = await query.getRawOne();
        if (!result) return 0;
        const count = parseInt(result.count);
        return count;
    }

    async remove(id: string): Promise<RequestPost> {
        return await this.repo.manager.transaction(async (trxManager) => {
            const requestPost = await trxManager.findOne(RequestPost, {
                where: { id },
                relations: [
                    'contributions',
                    'contributions.data',
                    'upvoted_by',
                    'downvoted_by',
                ],
            });

            if (!requestPost)
                throw new HttpException(
                    `Request post with ID ${id} not found`,
                    HttpStatus.NOT_FOUND,
                );
            for (const contribution of requestPost.contributions) {
                if (contribution.data) {
                    const data = contribution.data;
                    contribution.data = null;
                    await trxManager.save(contribution);
                    await trxManager.remove(data);
                }
                contribution.status = ContributionStatus.DELETED_REQUEST_POST;
                await trxManager.save(contribution);
            }

            requestPost.upvoted_by = [];
            requestPost.downvoted_by = [];
            await trxManager.save(requestPost);

            await trxManager.update(
                Contribution,
                { request_post: requestPost },
                { request_post: null },
            );

            // Delete the request post
            await trxManager.delete(RequestPost, id);
            return requestPost;
        });
    }
}
