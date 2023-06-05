import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindPagination } from 'src/common/interfaces';
import { Repository } from 'typeorm';
import { Dataset } from './dataset.entity';
import { User } from 'src/user/user.entity';
import { UpdateDatasetDto } from './dtos/update_dataset.dto';
import { DataTypeFilter, DatasetStatus, SortOrder } from 'src/common/defaults';

@Injectable()
export class DatasetService {
    constructor(@InjectRepository(Dataset) private repo: Repository<Dataset>) {}

    async create(dataset: Partial<Dataset>): Promise<Dataset> {
        let newDataset = this.repo.create(dataset);
        return await this.repo.save(newDataset);
    }

    async find(
        page?: number,
        limit?: number,
        search?: string,
        datatype?: DataTypeFilter,
        sortByDate?: SortOrder,
        sortByUpvotes?: SortOrder,
        sortByDownvotes?: SortOrder,
        userId?: string,
        status?: string,
    ): Promise<FindPagination<Dataset>> {
        const metadata = this.repo.metadata;
        let datasetColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        datasetColumns = datasetColumns.map((column) => `dataset.${column}`);
        const upvotesSubquery = this.repo
            .createQueryBuilder('dataset')
            .leftJoin('dataset.upvoted_by', 'upvoted_user')
            .select('dataset.id, COUNT(upvoted_user.id) as upvotes')
            .groupBy('dataset.id');

        const downvotesSubquery = this.repo
            .createQueryBuilder('dataset')
            .leftJoin('dataset.downvoted_by', 'downvoted_user')
            .select('dataset.id, COUNT(downvoted_user.id) as downvotes')
            .groupBy('dataset.id');

        const query = this.repo
            .createQueryBuilder('dataset')
            .leftJoinAndSelect('dataset.user', 'user')
            .leftJoinAndSelect('dataset.payment_plan', 'payment_plan')
            .leftJoinAndSelect('dataset.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('dataset.downvoted_by', 'downvoted_user')
            .leftJoinAndSelect('dataset.purchased_by', 'purchased_by_users')
            .select([
                ...datasetColumns,
                'user.id',
                'user.username',
                'user.email',
                'user.image',
                'payment_plan.id',
                'payment_plan.title',
                'payment_plan.disk_size',
                'purchased_by_users.id',
                'purchased_by_users.username',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .addSelect('upvotes.upvotes', 'upvotes')
            .addSelect('downvotes.downvotes', 'downvotes')
            .leftJoin(
                `(${upvotesSubquery.getQuery()})`,
                'upvotes',
                'upvotes.id = dataset.id',
            )
            .leftJoin(
                `(${downvotesSubquery.getQuery()})`,
                'downvotes',
                'downvotes.id = dataset.id',
            )
            .addGroupBy(
                [
                    'dataset.id',
                    'user.id',
                    'payment_plan.id',
                    'payment_plan.title',
                    'upvoted_user.id',
                    'downvoted_user.id',
                    'upvotes.upvotes',
                    'downvotes.downvotes',
                    'purchased_by_users.id',
                ].join(', '),
            );

        if (userId && status) {
            query.where('user.id = :userId AND dataset.status = :status', {
                userId,
                status,
            });
        } else if (userId) {
            query.where('user.id = :userId', { userId });
        } else {
            query.where('dataset.status = :status', {
                status: DatasetStatus.ACCEPTED,
            });
        }

        if (datatype && datatype !== DataTypeFilter.ALL) {
            query.andWhere('dataset.datatype = :datatype', {
                datatype,
            });
        }

        if (search && search !== '') {
            if (search && search !== '') {
                query.andWhere(
                    '(LOWER(dataset.title) LIKE LOWER(:searchString) OR LOWER(dataset.description) LIKE LOWER(:searchString))',
                    { searchString: `%${search.trim()}%` },
                );
            }
        }

        if (sortByDate) query.addOrderBy('dataset.created_at', sortByDate);
        if (sortByUpvotes) query.addOrderBy('upvotes', sortByUpvotes);
        if (sortByDownvotes) query.addOrderBy('downvotes', sortByDownvotes);

        const count = await query.getCount();

        if (limit) {
            query.take(limit);
            if (page) query.skip((page - 1) * limit);
        }

        const datasets = await query.getMany();

        return {
            results: datasets,
            total: count,
        };
    }

    async findById(id: string): Promise<Dataset> {
        const metadata = this.repo.metadata;
        let datasetColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        datasetColumns = datasetColumns.map((column) => `dataset.${column}`);
        return this.repo
            .createQueryBuilder('dataset')
            .leftJoinAndSelect('dataset.user', 'user')
            .leftJoinAndSelect('dataset.payment_plan', 'payment_plan')
            .leftJoinAndSelect('dataset.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('dataset.downvoted_by', 'downvoted_user')
            .leftJoinAndSelect('dataset.purchased_by', 'purchased_by_users')
            .where('dataset.id = :id', { id })
            .select([
                ...datasetColumns,
                'user.id',
                'user.username',
                'user.email',
                'user.image',
                'payment_plan.id',
                'payment_plan.title',
                'payment_plan.disk_size',
                'purchased_by_users.id',
                'purchased_by_users.username',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .getOne();
    }

    async upvote(id: string, user: User): Promise<Dataset> {
        const metadata = this.repo.metadata;
        let datasetColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        datasetColumns = datasetColumns.map((column) => `dataset.${column}`);
        const dataset = await this.repo
            .createQueryBuilder('dataset')
            .leftJoinAndSelect('dataset.user', 'user')
            .leftJoinAndSelect('dataset.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('dataset.downvoted_by', 'downvoted_user')
            .where('dataset.id = :id', { id })
            .select([
                ...datasetColumns,
                'user.id',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .getOne();

        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);

        if (dataset.status !== DatasetStatus.ACCEPTED)
            throw new HttpException(
                'Cannot upvote a dataset that is not Accepted',
                HttpStatus.BAD_REQUEST,
            );

        const arr = dataset.upvoted_by.filter(
            (upvoted_user) => user.id === upvoted_user.id,
        );
        const alreadyUpvoted: boolean = arr.length > 0;

        dataset.upvoted_by = dataset.upvoted_by.filter(
            (upvoted_user) => user.id !== upvoted_user.id,
        );

        if (!alreadyUpvoted) dataset.upvoted_by.push(user);

        dataset.downvoted_by = dataset.downvoted_by.filter(
            (downvoted_user) => user.id !== downvoted_user.id,
        );

        await this.repo.save(dataset);
        return this.repo
            .createQueryBuilder('dataset')
            .leftJoinAndSelect('dataset.user', 'user')
            .leftJoinAndSelect('dataset.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('dataset.downvoted_by', 'downvoted_user')
            .where('dataset.id = :id', { id })
            .select([
                'dataset.id',
                'user.id',
                'upvoted_user.username',
                'upvoted_user.id',
                'downvoted_user.id',
                'downvoted_user.username',
            ])
            .getOne();
    }

    async downvote(id: string, user: User): Promise<Dataset> {
        const metadata = this.repo.metadata;
        let datasetColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        datasetColumns = datasetColumns.map((column) => `dataset.${column}`);
        const dataset = await this.repo
            .createQueryBuilder('dataset')
            .leftJoinAndSelect('dataset.user', 'user')
            .leftJoinAndSelect('dataset.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('dataset.downvoted_by', 'downvoted_user')
            .where('dataset.id = :id', { id })
            .select([
                ...datasetColumns,
                'user.id',
                'upvoted_user.id',
                'downvoted_user.id',
            ])
            .getOne();

        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);

        if (dataset.status !== DatasetStatus.ACCEPTED)
            throw new HttpException(
                'Cannot downvote a dataset that is not Accepted',
                HttpStatus.BAD_REQUEST,
            );

        const arr = dataset.downvoted_by.filter(
            (downvoted_user) => user.id === downvoted_user.id,
        );
        const alreadyDownvoted: boolean = arr.length > 0;

        dataset.downvoted_by = dataset.downvoted_by.filter(
            (downvoted_user) => user.id !== downvoted_user.id,
        );

        if (!alreadyDownvoted) dataset.downvoted_by.push(user);

        dataset.upvoted_by = dataset.upvoted_by.filter(
            (upvoted_user) => user.id !== upvoted_user.id,
        );

        await this.repo.save(dataset);
        return this.repo
            .createQueryBuilder('dataset')
            .leftJoinAndSelect('dataset.user', 'user')
            .leftJoinAndSelect('dataset.upvoted_by', 'upvoted_user')
            .leftJoinAndSelect('dataset.downvoted_by', 'downvoted_user')
            .where('dataset.id = :id', { id })
            .select([
                'dataset.id',
                'user.id',
                'upvoted_user.username',
                'upvoted_user.id',
                'downvoted_user.id',
                'downvoted_user.username',
            ])
            .getOne();
    }

    async update(dataset: Dataset, attrs: Partial<Dataset>): Promise<Dataset> {
        Object.assign(dataset, attrs);
        return this.repo.save(dataset);
    }

    async remove(dataset: Dataset): Promise<Dataset> {
        return this.repo.remove(dataset);
    }
}
