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
    UseInterceptors,
    UploadedFile,
    HttpException,
    HttpStatus,
    Put,
    ParseEnumPipe,
    ParseBoolPipe,
} from '@nestjs/common';
import { CreateRequestPostDto } from './dtos/create_requestpost.dto';
import { UpdateRequestPostDto } from './dtos/update_requestpost.dto';
import { RequestpostService } from './requestpost.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ContributionService } from 'src/contribution/contribution.service';
import { plainToInstance } from 'class-transformer';
import { CreateContributionDto } from 'src/contribution/dtos/create_contribution.dto';
import { validate } from 'class-validator';
import { existsSync, unlinkSync } from 'fs';
import { User } from 'src/decorators/CurrentUser.decorator';
import { AuthorizedUserData } from 'src/common/interfaces';
import { PaymentplansService } from 'src/paymentplan/paymentplan.service';
import { DataService } from 'src/data/data.service';
import {
    ContributionStatus,
    DataType,
    DataTypeFilter,
    NotificationType,
    SortOrder,
} from 'src/common/defaults';
import { Contribution } from 'src/contribution/contribution.entity';
import { NotificationService } from 'src/notification/notification.service';
import { StringLengthValidationPipe } from 'src/pipes/StringLengthValidation.pipe';
import { EnumValidationPipe } from 'src/pipes/EnumValidation.pipe';
import { Public } from 'src/decorators/IsPublicRoute.decorator';
import { enumToString } from 'src/common/functions';

@Controller('requestpost')
export class RequestpostController {
    constructor(
        private dataService: DataService,
        private requestPostService: RequestpostService,
        private paymentPlanService: PaymentplansService,
        private notificationService: NotificationService,
        private contributionService: ContributionService,
    ) {}

    @Post()
    async create(
        @Body() body: CreateRequestPostDto,
        @User() user: AuthorizedUserData,
    ) {
        return this.requestPostService.create(body, user.userId);
    }

    @Get()
    @Public()
    async find(
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number,
        @Query(
            'search',
            new StringLengthValidationPipe(35, 'Search input too long'),
        )
        search?: string,
        @Query(
            'filter',
            new EnumValidationPipe(
                DataTypeFilter,
                `Filter input has to be one of: [${enumToString(
                    DataTypeFilter,
                )}]`,
            ),
        )
        filter?: DataTypeFilter,
        @Query(
            'sort',
            new EnumValidationPipe(
                SortOrder,
                `Sort input has to be one of: [${enumToString(SortOrder)}]`,
            ),
        )
        sort?: SortOrder,
        @Query('mobile') mobile?: string,
    ) {
        if (mobile && !['true', 'false'].includes(mobile))
            throw new HttpException(
                'Mobile query string must be one of: [true, false]',
                HttpStatus.BAD_REQUEST,
            );
        const platform = mobile && mobile == "true" ? true : false;
        return this.requestPostService.find(
            page,
            limit,
            search,
            filter,
            sort,
            platform,
        );
    }

    @Get(':id')
    async findById(@Param('id', ParseUUIDPipe) id: string) {
        return this.requestPostService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateRequestPostDto,
        @User() user: AuthorizedUserData,
    ) {
        const requestPost = await this.requestPostService.findById(id);
        if (requestPost && requestPost.user['id'] !== user.userId) {
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );
        }

        if (body.data_size) {
            if (body.payment_plan) {
                let paymentPlan = await this.paymentPlanService.findById(
                    body.payment_plan,
                );
                if (body.data_size >= paymentPlan.disk_size)
                    throw new HttpException(
                        `data_size is too large for the chosen Payment Plan data size: ${paymentPlan.disk_size}`,
                        HttpStatus.BAD_REQUEST,
                    );
            } else {
                let paymentPlan = await this.paymentPlanService.findById(
                    requestPost.payment_plan['id'],
                );
                if (body.data_size >= paymentPlan.disk_size)
                    throw new HttpException(
                        `data_size is too large for the chosen Payment Plan data size: ${paymentPlan.disk_size}`,
                        HttpStatus.BAD_REQUEST,
                    );
            }
        }

        return this.requestPostService.update(id, body);
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: AuthorizedUserData,
    ) {
        const requestPost = await this.requestPostService.findById(id);
        if (requestPost && requestPost.user !== user.userId) {
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );
        }
        return this.requestPostService.remove(id);
    }

    // Contribution
    @Post(':id/contribution/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadContribution(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Param('id') requestPostId: string,
        @User() user: AuthorizedUserData,
    ) {
        if (!file) {
            throw new HttpException(
                'Error uploading file',
                HttpStatus.BAD_REQUEST,
            );
        }

        // you can't contribute to own request post
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (user.userId === requestPost.user['id']) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                'Cannot contribute to this Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // Warn the user if the size of the contributed files is getting too full ??????????????????????????????????

        // validate the data type and uploaded file's size
        const bodyInstance = plainToInstance(CreateContributionDto, body);
        const errors = await validate(bodyInstance);

        if (errors.length > 0) {
            const constraints = errors[0].constraints;
            const message = constraints[Object.keys(constraints)[0]]; // get the first error message
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }

        // validate the body, if valid delete the file
        const { size, mimetype } = file;

        const [datatype, extension] = mimetype.split('/');

        if (
            datatype !== requestPost.datatype ||
            !requestPost.extensions.includes(extension)
        ) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                'Unsupported datatype for the current Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // create the data and contribution
        let data = null;

        // maybe create DTOs for them - Data and Contribution - and validate?
        try {
            data = await this.dataService.create({
                information: bodyInstance.data_information,
                label: bodyInstance.data_label,
                size: file.size,
                src: file.path,
                type: datatype,
                extension: mimetype,
            });
        } catch (error) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                "Couldn't save Data: " + error?.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (!data) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                "Couldn't save Data",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        let contribution = null;
        try {
            contribution = this.contributionService.create({
                data: data.id,
                earning: 0,
                request_post: requestPost.id,
                status: ContributionStatus.PENDING,
                user: user.userId,
            });
        } catch (error) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                "Couldn't save Contribution: " + error?.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (!contribution) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                "Couldn't save Contribution",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        await this.notificationService.create({
            title: NotificationType.CONTRIBUTION_MADE,
            from_user: user.userId,
            user: requestPost.id,
        });

        return contribution;
    }

    @Get(':id/contribution/')
    async findContribution(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Query('page', ParseIntPipe) page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.contributionService.find(requestPostId, page, limit);
    }

    @Put(':id/contribution/:contributionId/accept')
    async acceptContribution(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Param('contributionId', ParseUUIDPipe) contributionId: string,
        @User() user: AuthorizedUserData,
    ) {
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost)
            throw new HttpException(
                'Request post not found',
                HttpStatus.NOT_FOUND,
            );
        if (requestPost.user !== user.userId)
            throw new HttpException(
                'User not authorized',
                HttpStatus.UNAUTHORIZED,
            );

        const contribution = await this.contributionService.findById(
            contributionId,
        );
        if (!contribution)
            throw new HttpException(
                'Contribution not found',
                HttpStatus.NOT_FOUND,
            );

        await this.notificationService.create({
            title: NotificationType.CONTRIBUTION_ACCEPTED,
            from_user: user.userId,
            user: contribution.user,
        });

        return this.contributionService.update(contribution.id, {
            status: ContributionStatus.ACCEPTED,
        });
    }

    @Put(':id/contribution/:contributionId/reject')
    async rejectContribution(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Param('contributionId', ParseUUIDPipe) contributionId: string,
        @User() user: AuthorizedUserData,
    ) {
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost)
            throw new HttpException(
                'Request post not found',
                HttpStatus.NOT_FOUND,
            );
        if (requestPost.user !== user.userId)
            throw new HttpException(
                'User not authorized',
                HttpStatus.UNAUTHORIZED,
            );

        const contribution = await this.contributionService.findById(
            contributionId,
        );
        if (!contribution)
            throw new HttpException(
                'Contribution not found',
                HttpStatus.NOT_FOUND,
            );

        await this.notificationService.create({
            title: NotificationType.CONTRIBUTION_REJECTED,
            from_user: user.userId,
            user: contribution.user,
        });

        return this.contributionService.update(contribution.id, {
            status: ContributionStatus.REJECTED,
        });
    }

    @Delete(':id/contribution/:contributionId')
    async removeContribution(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Param('contributionId', ParseUUIDPipe) contributionId: string,
        @User() user: AuthorizedUserData,
    ): Promise<Contribution> {
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost)
            throw new HttpException(
                'Request post not found',
                HttpStatus.NOT_FOUND,
            );

        if (requestPost && requestPost.user !== user.userId) {
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const contribution = await this.contributionService.findById(
            contributionId,
        );
        if (!contribution || contribution.request_post !== requestPost.id) {
            throw new HttpException(
                'Contribution not found',
                HttpStatus.NOT_FOUND,
            );
        }

        return this.contributionService.remove(contribution.id);
    }
}
