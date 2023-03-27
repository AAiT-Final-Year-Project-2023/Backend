import {
    Controller,
    Post,
    Body,
    Get,
    Patch,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    ParseUUIDPipe,
} from '@nestjs/common';
import { CreateRequestPostDto } from './dtos/create_requestpost.dto';
import { UpdateRequestPostDto } from './dtos/update_requestpost.dto';
import { RequestpostService } from './requestpost.service';

@Controller('requestpost')
export class RequestpostController {
    constructor(private requestPostService: RequestpostService) {}

    @Post()
    async create(@Body() body: CreateRequestPostDto) {
        return this.requestPostService.create(body);
    }

    // don't forget to add offsets and limits
    @Get()
    async find(
        @Query('page', ParseIntPipe) page: number,
        @Query('limit') limit: number,
    ) {
        return this.requestPostService.find(page, limit);
    }

    @Get(':id')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.requestPostService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateRequestPostDto,
    ) {
        return this.requestPostService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.remove(id);
    }
}
