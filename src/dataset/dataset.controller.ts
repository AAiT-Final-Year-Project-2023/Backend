import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { CreateDatasetDto } from './dtos/create_dataset.dto';
import { UpdateDatasetDto } from './dtos/update_dataset.dto';
import { AuthorizedUserData } from 'src/common/interfaces';
import { User } from 'src/decorators/CurrentUser.decorator';
import { UserService } from 'src/user/user.service';

@Controller('dataset')
export class DatasetController {
    constructor(
        private datasetService: DatasetService,
        private userService: UserService,
    ) {}

    @Post()
    async create(
        @Body() body: CreateDatasetDto,
        @User() user: AuthorizedUserData,
    ) {
        const currUser = await this.userService.findById(user.userId);
        if (!currUser)
            throw new HttpException(
                'User not found',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        if (body.price !== 0 && !currUser.bank_information)
            throw new HttpException(
                'Cannot create a paid dataset without setting up bank information',
                HttpStatus.BAD_REQUEST,
            );
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
    findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.datasetService.findById(id);
    }

    @Patch(':id')
    update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateDatasetDto,
    ) {
        return this.datasetService.update(id, body);
    }

    @Delete(':id')
    delete(@Param('id', ParseUUIDPipe) id: string) {
        return this.datasetService.remove(id);
    }
}
