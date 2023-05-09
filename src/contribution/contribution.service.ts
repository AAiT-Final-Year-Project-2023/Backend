import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindPagination } from 'src/common/interfaces';
import { Repository } from 'typeorm';
import { Contribution } from './contribution.entity';

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
            (column) => `request_post.${column}`,
        );
        const size = await this.repo.count();

        const contributions = await this.repo
            .createQueryBuilder('contribution')
            .leftJoinAndSelect('contribution.user', 'user')
            .leftJoinAndSelect('contribution.data', 'data')
            .select([
                ...contributionColumns,
                'user.id',
                'user.username',
                'user.email',
                'user.image',
                'data.type',
                'data.size',
                'data.extension',
            ])
            .where(
                requestPostId
                    ? 'contribution.request_post = :request_post'
                    : '1=1',
                { request_post: requestPostId },
            )
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();

        return {
            results: contributions,
            total: size,
        };
    }

    async findById(id: string): Promise<Contribution> {
        return this.repo.findOne({ where: { id } });
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
        const contribution = await this.findById(id);
        if (!contribution)
            throw new HttpException(
                'Contribution not found',
                HttpStatus.NOT_FOUND,
            );
        return this.repo.remove(contribution);
    }
}
