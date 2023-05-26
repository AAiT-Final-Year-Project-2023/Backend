import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindPagination } from 'src/common/interfaces';
import { Repository } from 'typeorm';
import { Contribution } from './contribution.entity';
import { ContributionStatus } from 'src/common/defaults';

@Injectable()
export class ContributionService {
    constructor(
        @InjectRepository(Contribution) private repo: Repository<Contribution>,
    ) {}

    async create(contribution: Partial<Contribution>): Promise<Contribution> {
        const newContribution = this.repo.create(contribution);
        return this.repo.save(newContribution);
    }

    async find(
        requestPostId?: string,
        page?: number,
        limit?: number,
    ): Promise<FindPagination<Contribution>> {
        const metadata = this.repo.metadata;
        let contributionColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        contributionColumns = contributionColumns.map(
            (column) => `contribution.${column}`,
        );

        const query = this.repo
            .createQueryBuilder('contribution')
            .leftJoinAndSelect('contribution.user', 'user')
            .leftJoinAndSelect('contribution.data', 'data')
            .select([
                ...contributionColumns,
                'user.id',
                'user.username',
                'user.email',
                'user.image',
                'data.id',
                'data.type',
                'data.size',
                'data.extension',
            ]);

        if (requestPostId)
            query.where('contribution.request_post = :request_post', {
                request_post: requestPostId,
            });

        const count = await query.getCount();

        if (limit) {
            query.take(limit);
            if (page) query.skip((page - 1) * limit);
        }

        const contributions = await query.getMany();

        return {
            results: contributions,
            total: count,
        };
    }

    async findById(id: string): Promise<Contribution> {
        const metadata = this.repo.metadata;
        let contributionColumns = metadata.nonVirtualColumns.map(
            (column) => column.propertyName,
        );
        contributionColumns = contributionColumns.map(
            (column) => `contribution.${column}`,
        );
        return this.repo
            .createQueryBuilder('contribution')
            .leftJoinAndSelect('contribution.user', 'user')
            .leftJoinAndSelect('contribution.request_post', 'request_post')
            .leftJoinAndSelect('contribution.data', 'data')
            .where('contribution.id = :id', { id })
            .select([
                ...contributionColumns,
                'user.id',
                'user.username',
                'user.email',
                'user.image',
                'data.id',
                'data.type',
                'data.size',
                'data.extension',
                'request_post.id',
                'request_post.title',
            ])
            .getOne();
    }

    async update(
        id: string,
        attrs: Partial<Contribution>,
    ): Promise<Contribution> {
        const contribution = await this.findById(id);
        if (!contribution)
            throw new HttpException(
                'Contribution not found',
                HttpStatus.NOT_FOUND,
            );
        Object.assign(contribution, attrs);
        return this.repo.save(contribution);
    }

    async remove(id: string): Promise<Contribution> {
        const contribution = await this.repo
            .createQueryBuilder('contribution')
            .leftJoinAndSelect('contribution.data', 'data')
            .where('contribution.id = :id', { id })
            .getOne();

        if (!contribution)
            throw new HttpException(
                'Contribution not found',
                HttpStatus.NOT_FOUND,
            );

        if (contribution.status === ContributionStatus.ACCEPTED) {
            throw new HttpException(
                'Cannot delete an accepted contribution',
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.repo.manager.transaction(async (manager) => {
            await manager.remove(contribution);
            await manager.remove(contribution.data);
        });
        return contribution;
    }
}
