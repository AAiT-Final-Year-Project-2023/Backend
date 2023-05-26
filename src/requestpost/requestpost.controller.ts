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
    DataTypeFilter,
    DatasetAccess,
    FilterContributionByStatus,
    NotificationType,
    Owner,
    SortOrder,
} from 'src/common/defaults';
import { Contribution } from 'src/contribution/contribution.entity';
import { NotificationService } from 'src/notification/notification.service';
import { StringLengthValidationPipe } from 'src/pipes/StringLengthValidation.pipe';
import { EnumValidationPipe } from 'src/pipes/EnumValidation.pipe';
import { deleteFolderRecursive, enumToString } from 'src/common/functions';
import { UserService } from 'src/user/user.service';
import { User as userEntity } from 'src/user/user.entity';
import { Public } from 'src/decorators/IsPublicRoute.decorator';
import { OptionalBooleanPipe } from 'src/pipes/OptionalBoolean.pipe';

@Controller('requestpost')
export class RequestpostController {
    constructor(
        private dataService: DataService,
        private requestPostService: RequestpostService,
        private paymentPlanService: PaymentplansService,
        private notificationService: NotificationService,
        private contributionService: ContributionService,
        private userService: UserService,
    ) {}

    @Post()
    async create(
        @Body() body: CreateRequestPostDto,
        @User() user: AuthorizedUserData,
    ) {
        const currUser = await this.userService.findById(user.userId);
        const paymentPlan = await this.paymentPlanService.findById(
            body.payment_plan,
        );
        return this.requestPostService.create(
            {
                ...body,
                payment_plan: paymentPlan,
            },
            currUser,
        );
    }

    @Get()
    async find(
        @User() user: AuthorizedUserData,
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
            'sortByDate',
            new EnumValidationPipe(
                SortOrder,
                `sortByDate input has to be one of: [${enumToString(
                    SortOrder,
                )}]`,
            ),
        )
        sortByDate?: SortOrder,
        @Query(
            'sortByUpvotes',
            new EnumValidationPipe(
                SortOrder,
                `sortByUpvotes input has to be one of: [${enumToString(
                    SortOrder,
                )}]`,
            ),
        )
        sortByUpvotes?: SortOrder,
        @Query(
            'sortByDownvotes',
            new EnumValidationPipe(
                SortOrder,
                `sortByDownvotes input has to be one of: [${enumToString(
                    SortOrder,
                )}]`,
            ),
        )
        sortByDownvotes?: SortOrder,
        @Query(
            'owner',
            new EnumValidationPipe(
                Owner,
                `Owner input has to be one of: [${enumToString(Owner)}]`,
            ),
        )
        owner?: Owner,
        @Query('mobile', new OptionalBooleanPipe()) mobile: boolean = undefined,
        @Query('closed', new OptionalBooleanPipe()) closed: boolean = undefined,
    ) {
        return this.requestPostService.find(
            page,
            limit,
            search,
            filter,
            sortByDate,
            sortByUpvotes,
            sortByDownvotes,
            owner === Owner.ME ? user.userId : undefined,
            mobile,
            closed,
        );
    }

    @Get(':id')
    async findById(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: AuthorizedUserData,
    ) {
        const requestPost = await this.requestPostService.findById(id);
        if (
            requestPost.access === DatasetAccess.PRIVATE &&
            requestPost.user.id !== user.userId
        )
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );

        return requestPost;
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateRequestPostDto,
        @User() user: AuthorizedUserData,
    ) {
        const requestPost = await this.requestPostService.findById(id);
        if (requestPost && requestPost.user.id !== user.userId) {
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
                    requestPost.payment_plan.id,
                );
                if (body.data_size >= paymentPlan.disk_size)
                    throw new HttpException(
                        `data_size is too large for the chosen Payment Plan data size: ${paymentPlan.disk_size}`,
                        HttpStatus.BAD_REQUEST,
                    );
            }
        }

        let paymentPlan = await this.paymentPlanService.findById(
            body.payment_plan,
        );

        return this.requestPostService.update(id, {
            ...body,
            payment_plan: paymentPlan,
        });
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: AuthorizedUserData,
    ) {
        const requestPost = await this.requestPostService.findById(id);
        if (requestPost && requestPost.user.id !== user.userId) {
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );
        }
        const deletedRequestPost = await this.requestPostService.remove(id);

        const requestPostDataFolderPath = `./uploads/request_posts/${requestPost.id}`;
        if (deletedRequestPost) {
            deleteFolderRecursive(requestPostDataFolderPath);
        }

        return requestPost;
    }

    @Get(':id/close')
    async closeRequestPost(
        @Param('id', ParseUUIDPipe) requestPostId: string,
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

        if (requestPost.user.id !== user.userId)
            throw new HttpException(
                'User not authorized',
                HttpStatus.UNAUTHORIZED,
            );

        return this.requestPostService.close(requestPostId);
    }

    @Get(':id/makePrivate')
    async makePrivate(
        @Param('id', ParseUUIDPipe) requestPostId: string,
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
        if (requestPost.user.id !== user.userId)
            throw new HttpException(
                'User not authorized',
                HttpStatus.UNAUTHORIZED,
            );

        return this.requestPostService.makePrivate(requestPostId);
    }

    @Get(':id/makePublic')
    async makePublic(
        @Param('id', ParseUUIDPipe) requestPostId: string,
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
        if (requestPost.user.id !== user.userId)
            throw new HttpException(
                'User not authorized',
                HttpStatus.UNAUTHORIZED,
            );

        return this.requestPostService.makePublic(requestPostId);
    }

    @Get(':id/upvote')
    async upvote(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
    ) {
        const userEntity: userEntity = await this.userService.findById(
            user.userId,
        );
        return this.requestPostService.upvote(requestPostId, userEntity);
    }

    @Get(':id/downvote')
    async downvote(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
    ) {
        const userEntity: userEntity = await this.userService.findById(
            user.userId,
        );
        return this.requestPostService.downvote(requestPostId, userEntity);
    }

    @Public()
    @Get(':id/diskUsage')
    async diskUsage(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
        @Query(
            'status',
            new EnumValidationPipe(
                FilterContributionByStatus,
                `status input has to be one of: [${enumToString(
                    FilterContributionByStatus,
                )}]`,
            ),
        )
        status?: FilterContributionByStatus,
    ) {
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost)
            throw new HttpException(
                'Request post not found',
                HttpStatus.NOT_FOUND,
            );
        return this.requestPostService.diskUsage(requestPostId, status);
    }

    @Public()
    @Get(':id/contributionsCount')
    async contributionsCount(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
        @Query(
            'status',
            new EnumValidationPipe(
                FilterContributionByStatus,
                `status input has to be one of: [${enumToString(
                    FilterContributionByStatus,
                )}]`,
            ),
        )
        status?: FilterContributionByStatus,
    ) {
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost)
            throw new HttpException(
                'Request post not found',
                HttpStatus.NOT_FOUND,
            );
        return this.requestPostService.requestPostContributionsCount(
            requestPostId,
            status,
        );
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
        if (user.userId === requestPost.user.id) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                'Cannot contribute to this Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // cannot contribute to a closed request post
        if (requestPost.closed) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                'Cannot contribute to a closed Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // cannot contribute to a private request post
        if (requestPost.access === DatasetAccess.PRIVATE) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                'Cannot contribute to a private Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // cannot contribute if a user hasn't setup their bank information
        const currUser = await this.userService.findById(user.userId);
        if (!currUser) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // if (!currUser.bank_information){
        //     if (existsSync(file.path)) unlinkSync(file.path);
        //     throw new HttpException(
        //         'Bank information not set',
        //         HttpStatus.BAD_REQUEST,
        //     );
        // }

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

        if (requestPost.data_size < size) {
            if (existsSync(file.path)) unlinkSync(file.path);
            throw new HttpException(
                `Contribution file too big, maximum allowed for this request post: ${requestPost.data_size} bytes`,
                HttpStatus.PAYLOAD_TOO_LARGE,
            );
        }

        // check if the payment plan has free space or not
        const { used, total } = await this.requestPostService.diskUsage(
            requestPostId,
            FilterContributionByStatus.ACCEPTED,
        );
        // check if it's full
        if (size + used > total) {
            throw new HttpException(
                `Contribution file too big, request post space is running out: ${used} / ${total} bytes`,
                HttpStatus.PAYLOAD_TOO_LARGE,
            );
        }

        // send warning notification if it's above 80%
        const percentageUsed: number = (used / total) * 100;

        if (percentageUsed > 95) {
            // await this.notificationService.create({
            //     title: NotificationType.SPACE_USAGE_WARNING,
            //     from_user: user.userId,
            //     user: requestPost.user.id,
            // });
        }

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
                request_post: requestPost,
                status: ContributionStatus.PENDING,
                user: currUser,
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

        // await this.notificationService.create({
        //     title: NotificationType.CONTRIBUTION_MADE,
        //     from_user: user.userId,
        //     user: requestPost.user.id,
        // });

        return contribution;
    }

    @Get(':id/contribution/')
    async findContributions(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Query('page', ParseIntPipe) page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.contributionService.find(requestPostId, page, limit);
    }

    @Get(':id/contribution/:contributionId')
    async findContribution(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Param('contributionId', ParseUUIDPipe) contributionId: string,
    ) {
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost)
            throw new HttpException(
                'Request post not found',
                HttpStatus.NOT_FOUND,
            );
        return this.contributionService.findById(contributionId);
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
        if (requestPost.user.id !== user.userId)
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

        if (contribution.status !== ContributionStatus.PENDING)
            throw new HttpException(
                `Contribution is already ${contribution.status}`,
                HttpStatus.BAD_REQUEST,
            );

        // await this.notificationService.create({
        //     title: NotificationType.CONTRIBUTION_ACCEPTED,
        //     from_user: user.userId,
        //     user: contribution.user.id,
        // });

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
        if (requestPost.user.id !== user.userId)
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

        if (contribution.status !== ContributionStatus.PENDING)
            throw new HttpException(
                `Contribution is already ${contribution.status}`,
                HttpStatus.BAD_REQUEST,
            );

        // await this.notificationService.create({
        //     title: NotificationType.CONTRIBUTION_REJECTED,
        //     from_user: user.userId,
        //     user: contribution.user,
        // });

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

        const contribution = await this.contributionService.findById(
            contributionId,
        );

        if (!contribution || contribution.request_post.id !== requestPost.id) {
            throw new HttpException(
                'Contribution not found',
                HttpStatus.NOT_FOUND,
            );
        }

        if (contribution.user.id !== user.userId) {
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );
        }

        const data = await this.dataService.findById(contribution.data.id);
        const fileLocation = data.src;
        const deletedContribution = this.contributionService.remove(
            contribution.id,
        );
        if (deletedContribution && existsSync(fileLocation))
            unlinkSync(fileLocation);
        return deletedContribution;
    }
}
