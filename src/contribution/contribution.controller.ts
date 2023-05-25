import {
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { ContributionService } from './contribution.service';
import { AuthorizedUserData } from 'src/common/interfaces';
import { User } from 'src/decorators/CurrentUser.decorator';
import { ContributionStatus } from 'src/common/defaults';
import { DataService } from 'src/data/data.service';
import { existsSync, unlinkSync } from 'fs';

@Controller('contribution')
export class ContributionController {
    constructor(
        private contributionService: ContributionService,
        private dataService: DataService,
    ) {}

    @Get()
    async find(
        @Query('request_post', ParseUUIDPipe) requestPostId?: string,
        @Query('page', ParseIntPipe) page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.contributionService.find(requestPostId, page, limit);
    }

    @Get(':id')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.contributionService.findById(id);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: AuthorizedUserData,
    ) {
        const contribution = await this.contributionService.findById(id);
        if (!contribution)
            throw new HttpException(
                'Contribution not found',
                HttpStatus.NOT_FOUND,
            );
        if (contribution.user.id !== user.userId)
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );
        if (contribution.status === ContributionStatus.ACCEPTED)
            throw new HttpException(
                `Cannot delete contribution with status: ${ContributionStatus.ACCEPTED}`,
                HttpStatus.BAD_REQUEST,
            );

        const data = await this.dataService.findById(contribution.data.id);
        if (data) {
            const fileSrc = data.src;
            if (existsSync(fileSrc)) unlinkSync(fileSrc);
        }

        return this.contributionService.remove(id);
    }
}
