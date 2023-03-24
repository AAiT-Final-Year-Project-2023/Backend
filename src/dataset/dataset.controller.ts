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
import { DatasetService } from './dataset.service';
import { CreateDatasetDto } from './dtos/create_dataset.dto';
import { UpdateDatasetDto } from './dtos/update_dataset.dto';

@Controller('dataset')
export class DatasetController {
    constructor(private datasetService: DatasetService) {}

    @Post()
    create(@Body() body: CreateDatasetDto) {
        return this.datasetService.create(body);
    }

    @Get()
    find(
        @Query('page', ParseIntPipe) page: number,
        @Query('limit') limit: number,
    ) {
        return this.datasetService.find(page, limit);
    }

    @Get(':id')
    findById(@Param('id', ParseIntPipe) id: number) {
        return this.datasetService.findById(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdateDatasetDto,
    ) {
        return this.datasetService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.datasetService.remove(id);
    }
}
