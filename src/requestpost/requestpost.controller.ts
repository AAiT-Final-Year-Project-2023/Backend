import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Delete,
    Query,
    ParseIntPipe,
    ParseUUIDPipe,
    UseInterceptors,
    UploadedFile,
    HttpException,
    HttpStatus,
    Patch,
    Res,
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
import { AuthorizedUserData, FindPagination } from 'src/common/interfaces';
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
import {
    deleteFile,
    deleteFolderRecursive,
    enumToString,
} from 'src/common/functions';
import { UserService } from 'src/user/user.service';
import { User as userEntity } from 'src/user/user.entity';
import { Public } from 'src/decorators/IsPublicRoute.decorator';
import { OptionalBooleanPipe } from 'src/pipes/OptionalBoolean.pipe';
import { RequestPost } from './requestpost.entity';
import { Data } from 'src/data/data.entity';
import * as archiver from 'archiver';
import * as fs from 'fs';
import { Response } from 'express';

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
    ): Promise<RequestPost> {
        const currUser = await this.userService.findById(user.userId);
        const paymentPlan = await this.paymentPlanService.findById(
            body.payment_plan,
        );

        const newRequestPost = await this.requestPostService.create(
            {
                ...body,
                payment_plan: paymentPlan,
            },
            currUser,
        );

        if (newRequestPost && currUser) {
            await this.notificationService.create({
                to: currUser,
                from: null,
                title: NotificationType.REQUEST_POST_CREATED,
                describtion: `A new Request Post with id=${newRequestPost.id} created`,
            });
        }

        return newRequestPost;
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
    ): Promise<FindPagination<RequestPost>> {
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
    ): Promise<RequestPost> {
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
    ): Promise<RequestPost> {
        const requestPost = await this.requestPostService.findById(id);
        if (!requestPost)
            throw new HttpException(
                'Request post not found',
                HttpStatus.NOT_FOUND,
            );

        if (requestPost && requestPost.user.id !== user.userId) {
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );
        }
        const currUser = requestPost.user;

        if (body.data_size) {
            if (body.payment_plan) {
                const paymentPlan = await this.paymentPlanService.findById(
                    body.payment_plan,
                );
                if (body.data_size >= paymentPlan.disk_size)
                    throw new HttpException(
                        `data_size is too large for the chosen Payment Plan data size: ${paymentPlan.disk_size}`,
                        HttpStatus.BAD_REQUEST,
                    );
            } else {
                const paymentPlan = await this.paymentPlanService.findById(
                    requestPost.payment_plan.id,
                );
                if (body.data_size >= paymentPlan.disk_size)
                    throw new HttpException(
                        `data_size is too large for the chosen Payment Plan data size: ${paymentPlan.disk_size}`,
                        HttpStatus.BAD_REQUEST,
                    );
            }
        }

        const paymentPlan = await this.paymentPlanService.findById(
            body.payment_plan,
        );

        if (paymentPlan.disk_size <= requestPost.data_size)
            throw new HttpException(
                'Payment plan disk space too small for the max file size set for the request post',
                HttpStatus.BAD_REQUEST,
            );

        const updatedRequestPost = await this.requestPostService.update(id, {
            ...body,
            payment_plan: paymentPlan,
        });

        if (updatedRequestPost && currUser) {
            await this.notificationService.create({
                to: currUser,
                from: null,
                title: NotificationType.REQUEST_POST_UPDATED,
                describtion: `Request post with id=${updatedRequestPost.id} successfully updated`,
            });
        }

        return updatedRequestPost;
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: AuthorizedUserData,
    ): Promise<RequestPost> {
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
        const currUser = deletedRequestPost.user;

        if (deletedRequestPost && currUser) {
            await this.notificationService.create({
                to: currUser,
                from: null,
                title: NotificationType.REQUEST_POST_DELETED,
                describtion: `Request post with id=${deletedRequestPost.id} successfully deleted`,
            });
        }

        return requestPost;
    }

    @Get(':id/close')
    async closeRequestPost(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
    ): Promise<RequestPost> {
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

        const currUser = requestPost.user;
        const closedRequestPost = await this.requestPostService.close(
            requestPostId,
        );

        if (closedRequestPost && currUser) {
            await this.notificationService.create({
                to: currUser,
                from: null,
                title: NotificationType.REQUEST_POST_CLOSED,
                describtion: `Request post with id=${closedRequestPost.id} closed successfully`,
            });
        }
        return closedRequestPost;
    }

    @Get(':id/makePrivate')
    async makePrivate(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
    ): Promise<RequestPost> {
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

        const currUser = requestPost.user;
        const privateRequestPost = await this.requestPostService.makePrivate(
            requestPostId,
        );

        if (privateRequestPost && currUser) {
            await this.notificationService.create({
                to: currUser,
                from: null,
                title: NotificationType.REQUEST_POST_PRIVATE,
                describtion: `Request post with id=${privateRequestPost.id} successfully made private`,
            });
        }

        return privateRequestPost;
    }

    @Get(':id/makePublic')
    async makePublic(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
    ): Promise<RequestPost> {
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

        const currUser = requestPost.user;
        const publicRequestPost = await this.requestPostService.makePublic(
            requestPostId,
        );

        if (publicRequestPost && currUser) {
            await this.notificationService.create({
                to: currUser,
                from: null,
                title: NotificationType.REQUEST_POST_PUBLIC,
                describtion: `Request post with id=${publicRequestPost.id} successfully made public`,
            });
        }
        return publicRequestPost;
    }

    @Get(':id/upvote')
    async upvote(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
    ): Promise<RequestPost> {
        const currUser: userEntity = await this.userService.findById(
            user.userId,
        );
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );

        const toUser = requestPost.user;
        const upvotedPostRequest = await this.requestPostService.upvote(
            requestPostId,
            currUser,
        );

        if (upvotedPostRequest && toUser && currUser) {
            await this.notificationService.create({
                to: toUser,
                from: currUser,
                title: NotificationType.REQUEST_POST_UPVOTED,
                describtion: `User with id=${currUser.id} upvoted your request post with id=${upvotedPostRequest.id}`,
            });
        }
        return upvotedPostRequest;
    }

    @Get(':id/downvote')
    async downvote(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @User() user: AuthorizedUserData,
    ): Promise<RequestPost> {
        const currUser: userEntity = await this.userService.findById(
            user.userId,
        );
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        if (!requestPost)
            throw new HttpException(
                'Request Post not found',
                HttpStatus.NOT_FOUND,
            );

        const toUser = requestPost.user;
        const downvotedRequestPost = await this.requestPostService.downvote(
            requestPostId,
            currUser,
        );

        if (downvotedRequestPost && toUser && currUser) {
            await this.notificationService.create({
                to: toUser,
                from: currUser,
                title: NotificationType.REQUEST_POST_DOWNVOTED,
                describtion: `User with id=${currUser.id} downvoted your request post with id=${downvotedRequestPost.id}`,
            });
        }
        return downvotedRequestPost;
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
    ): Promise<{
        used: number;
        total: number;
    }> {
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
    ): Promise<number> {
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

    @Get(':id/download')
    async downloadRequestPost(
        @User() user: AuthorizedUserData,
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Res() res: Response,
    ) {
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );

        if (!requestPost)
            throw new HttpException(
                'Request post not found',
                HttpStatus.NOT_FOUND,
            );

        const contributions = await this.contributionService.find(
            requestPost.id,
        );

        if (!contributions)
            throw new HttpException(
                'Error loading contributions',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        if (!requestPost.closed)
            throw new HttpException(
                "Cannot download a request post unless it's closed",
                HttpStatus.BAD_REQUEST,
            );

        if (
            requestPost.access !== DatasetAccess.PUBLIC &&
            requestPost.user.id !== user.userId
        )
            throw new HttpException(
                "Cannot download a request post unless it's public or you are the owner",
                HttpStatus.BAD_REQUEST,
            );

        const requestPostName = `[${requestPost.title}] by user: [${requestPost?.user?.username}].zip`;

        const path = `./uploads/request_posts/${requestPostId}`;
        if (!fs.existsSync(path))
            throw new HttpException(
                `Request post data not found`,
                HttpStatus.NOT_FOUND,
            );

        const archive = archiver.create('zip', { zlib: { level: 9 } });

        archive.on('error', (err) => {
            throw new HttpException(
                'Error preparing download file.' + err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        });

        const labels = {};
        contributions.results.forEach((contribution) => {
            const label = contribution.data.label;
            labels[contribution.id] = label;
        });

        res.attachment(`${requestPostName}`);

        try {
            const files = await fs.promises.readdir(path);

            for (const file of files) {
                const filePath = `${path}/${file}`;
                archive.file(filePath, { name: file });
            }

            archive.append(JSON.stringify(labels, null, 4), {
                name: 'labels.json',
            });

            archive.pipe(res);
            res.on('finish', () => {
                console.log(
                    `Download of request post with id: ${requestPost.id} has finished.`,
                );
            });

            archive.finalize();
        } catch (err) {
            throw new HttpException(
                'Error downloading file: ' + err.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // Contribution
    @Post(':id/contribution/upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadContribution(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @Param('id') requestPostId: string,
        @User() user: AuthorizedUserData,
    ): Promise<Contribution> {
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
            deleteFile(file.path);
            throw new HttpException(
                'Cannot contribute to this Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // cannot contribute to a closed request post
        if (requestPost.closed) {
            deleteFile(file.path);
            throw new HttpException(
                'Cannot contribute to a closed Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // cannot contribute to a private request post
        if (requestPost.access === DatasetAccess.PRIVATE) {
            deleteFile(file.path);
            throw new HttpException(
                'Cannot contribute to a private Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // cannot contribute if a user hasn't setup their bank information
        const currUser = await this.userService.findById(user.userId);
        if (!currUser) {
            deleteFile(file.path);
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        if (
            !currUser.bank_information &&
            requestPost.payment.toString() !== '$0.00'
        ) {
            deleteFile(file.path);
            throw new HttpException(
                'Cannot contribute to a paid request post Bank information not set',
                HttpStatus.BAD_REQUEST,
            );
        }

        // validate the data type and uploaded file's size
        const bodyInstance = plainToInstance(CreateContributionDto, body);
        const errors = await validate(bodyInstance);

        if (errors.length > 0) {
            const constraints = errors[0].constraints;
            const message = constraints[Object.keys(constraints)[0]];
            deleteFile(file.path);
            throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }

        // validate the body, if valid delete the file
        const { size, mimetype } = file;

        if (requestPost.data_size < size) {
            deleteFile(file.path);
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
            deleteFile(file.path);
            throw new HttpException(
                `Contribution file too big, request post space is running out: ${used} / ${total} bytes`,
                HttpStatus.PAYLOAD_TOO_LARGE,
            );
        }

        const [datatype, extension] = mimetype.split('/');

        if (
            datatype !== requestPost.datatype ||
            !requestPost.extensions.includes(extension)
        ) {
            deleteFile(file.path);
            throw new HttpException(
                'Unsupported datatype for the current Request Post',
                HttpStatus.BAD_REQUEST,
            );
        }

        // create the data and contribution
        let data: Data = null;

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
            deleteFile(file.path);
            throw new HttpException(
                "Couldn't save Data: " + error?.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (!data) {
            deleteFile(file.path);
            throw new HttpException(
                "Couldn't save Data",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        let contribution = null;
        try {
            contribution = this.contributionService.create({
                data,
                earning: 0,
                request_post: requestPost,
                status: ContributionStatus.PENDING,
                user: currUser,
            });
        } catch (error) {
            await this.dataService.remove(data.id);
            deleteFile(file.path);
            throw new HttpException(
                "Couldn't save Contribution: " + error?.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        if (!contribution) {
            await this.dataService.remove(data.id);
            deleteFile(file.path);
            throw new HttpException(
                "Couldn't save Contribution",
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }

        // send warning notification if it's above 80%
        const percentageUsed: number = (used / total) * 100;

        if (percentageUsed > 95) {
            await this.notificationService.create({
                title: NotificationType.REQUEST_POST_SPACE_WARNING,
                to: currUser,
                from: null,
                describtion: `Request post with id=${requestPost.id} has over 95% disk usage`,
            });
        }

        await this.notificationService.create({
            title: NotificationType.REQUEST_POST_CONTRIBUTION_MADE,
            to: requestPost.user,
            from: currUser,
            describtion: `User with id=${currUser.id} contributed to your request post with id=${requestPost.user.id}`,
        });

        await this.notificationService.create({
            title: NotificationType.CONTRIBUTION_CREATED,
            to: currUser,
            from: null,
            describtion: `Contribution with id=${contribution.id} successfully created`,
        });

        return contribution;
    }

    @Get(':id/contribution/')
    async findContributions(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Query('page', ParseIntPipe) page?: number,
        @Query('limit') limit?: number,
    ): Promise<FindPagination<Contribution>> {
        return this.contributionService.find(requestPostId, page, limit);
    }

    @Get(':id/contribution/:contributionId')
    async findContribution(
        @Param('id', ParseUUIDPipe) requestPostId: string,
        @Param('contributionId', ParseUUIDPipe) contributionId: string,
    ): Promise<Contribution> {
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

    @Patch(':id/contribution/:contributionId/accept')
    async acceptContribution(
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

        const currUser = await this.userService.findById(user.userId);
        const acceptedContribution = await this.contributionService.update(
            contribution.id,
            {
                status: ContributionStatus.ACCEPTED,
            },
        );

        if (currUser && acceptedContribution) {
            await this.notificationService.create({
                title: NotificationType.CONTRIBUTION_ACCEPTED,
                to: contribution.user,
                from: currUser,
                describtion: `Your contribution with id=${contribution.id} made to request post with id=${requestPost.id} is accepted`,
            });
        }

        return acceptedContribution;
    }

    @Patch(':id/contribution/:contributionId/reject')
    async rejectContribution(
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

        const currUser = await this.userService.findById(user.userId);
        const rejectedRequestPost = await this.contributionService.update(
            contribution.id,
            {
                status: ContributionStatus.REJECTED,
            },
        );

        if (rejectedRequestPost && currUser) {
            await this.notificationService.create({
                title: NotificationType.CONTRIBUTION_REJECTED,
                to: contribution.user,
                from: currUser,
                describtion: `Your contribution with id=${contribution.id} made to request post with id=${requestPost.id} is rejected`,
            });
        }
        return rejectedRequestPost;
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
        const deletedContribution = await this.contributionService.remove(
            contribution.id,
        );
        if (deletedContribution && existsSync(fileLocation))
            unlinkSync(fileLocation);

        if (deletedContribution && contribution.user) {
            await this.notificationService.create({
                title: NotificationType.CONTRIBUTION_DELETED,
                to: contribution.user,
                from: null,
                describtion: `Contribution with id=${deletedContribution.id} deleted successfully`,
            });
        }
        return deletedContribution;
    }
}
