import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { CreateContributionDto } from './dtos/create_contribution.dto';
import { UpdateContributionDto } from './dtos/update_contribution.dto';
import { ContributionService } from './contribution.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('contribution')
export class ContributionController {
    constructor(private contributionService: ContributionService) {}

    // name the file like: post_request_id/user_id+timestamp
    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: CreateContributionDto,
    ) {
        console.log(file);
        // return this.contributionService.create(body);
    }

    @Get()
    async find(
        @Query('requestPostId', ParseUUIDPipe) requestPostId?: string,
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
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.contributionService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateContributionDto,
    ) {
        return this.contributionService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.contributionService.remove(id);
    }
}
