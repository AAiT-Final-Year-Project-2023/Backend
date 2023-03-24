import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { CreateContributionDto } from './dtos/create_contribution.dto';
import { UpdateContributionDto } from './dtos/update_contribution.dto';
import { ContributionService } from './contribution.service';

@Controller('contribution')
export class ContributionController {
    constructor(private contributionService: ContributionService) {}

    @Post()
    async create(@Body() body: CreateContributionDto) {
        return this.contributionService.create(body);
    }

    @Get()
    async find(
        @Query('requestPostId', ParseIntPipe) requestPostId?: number,
        @Query('page', ParseIntPipe) page?: number,
        @Query('limit') limit?: number,
    ) {
        if (requestPostId)
            return this.contributionService.findRequestPostContributions(
                requestPostId,
                page,
                limit,
            );
        return this.contributionService.find(page, limit);
    }

    @Get(':id')
    async findById(@Param('id', ParseIntPipe) id: number) {
        return this.contributionService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateContributionDto,
    ) {
        return this.contributionService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.contributionService.remove(id);
    }
}
