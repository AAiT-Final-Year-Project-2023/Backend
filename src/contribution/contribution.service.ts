import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindPagination } from 'src/common/interfaces';
import { Repository } from 'typeorm';
import { Contribution } from './contribution.entity';
import { CreateContributionDto } from './dtos/create_contribution.dto';

@Injectable()
export class ContributionService {
    constructor(
        @InjectRepository(Contribution) private repo: Repository<Contribution>,
    ) {}

    async create(contribution: CreateContributionDto): Promise<Contribution> {
        const newContribution = await this.repo.create(contribution);
        return this.repo.save(newContribution);
    }

    async find(
        page?: number,
        limit?: number,
    ): Promise<FindPagination<Contribution>> {
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

    async findRequestPostContributions(
        requestPostId: string,
        limit?: number,
        page?: number,
    ): Promise<FindPagination<Contribution>> {
        const size = this.repo.count();
        const requestPosts = this.repo.find({
            where: {
                request_post: requestPostId,
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            results: requestPosts,
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
