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
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { DatasetService } from './dataset.service';
import { CreateDatasetDto } from './dtos/create_dataset.dto';
import { UpdateDatasetDto } from './dtos/update_dataset.dto';
import { AuthorizedUserData } from 'src/common/interfaces';
import { User } from 'src/decorators/CurrentUser.decorator';
import { UserService } from 'src/user/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentplansService } from 'src/paymentplan/paymentplan.service';
import { deleteFile, enumToString } from 'src/common/functions';
import { NotificationService } from 'src/notification/notification.service';
import {
    DataTypeFilter,
    DatasetStatus,
    NotificationType,
    Owner,
    SortOrder,
    UserRole,
} from 'src/common/defaults';
import { EnumValidationPipe } from 'src/pipes/EnumValidation.pipe';
import { StringLengthValidationPipe } from 'src/pipes/StringLengthValidation.pipe';
import { Dataset } from './dataset.entity';
import { User as UserEntity } from 'src/user/user.entity';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Response } from 'express';
import * as fs from 'fs';
import { Public } from 'src/decorators/IsPublicRoute.decorator';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('dataset')
export class DatasetController {
    constructor(
        private datasetService: DatasetService,
        private userService: UserService,
        private paymentPlanService: PaymentplansService,
        private notificationService: NotificationService,
    ) {}

    @Post('/upload')
    @UseInterceptors(FileInterceptor('file'))
    async create(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
        @User() user: AuthorizedUserData,
    ) {
        const MAXIMUM_DATASET_SIZE = 5 * 1024 * 1024 * 1024;
        const labelsString = body.labels;
        let labelsArray = [];
        if (labelsString) {
            labelsArray = labelsString.split(',');
        }
        labelsArray = labelsArray
            .filter((label) => label !== '')
            .map((label: String) => label.trim());
        body.labels = labelsArray;

        // const price = parseInt(body.price);
        // body.price = isNaN(price) ? body.price : price;
        const price = 0;

        const bodyInstance = plainToInstance(CreateDatasetDto, body);
        const errors = await validate(bodyInstance);

        if (errors.length > 0) {
            if (file) deleteFile(file.path);
            const constraints = errors[0].constraints;
            const message = constraints[Object.keys(constraints)[0]];
            throw new HttpException(message, HttpStatus.BAD_REQUEST);
        }

        if (!file)
            throw new HttpException(
                'Error uploading file',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        const { size, mimetype, path } = file;

        const currUser = await this.userService.findById(user.userId);
        if (!currUser) {
            deleteFile(path);
            throw new HttpException(
                'User not found',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
        const paymentPlan = await this.paymentPlanService.findFree();
        if (!paymentPlan) {
            deleteFile(path);
            throw new HttpException(
                'Free payment plan not found',
                HttpStatus.NOT_FOUND,
            );
        }

        // if (body.price !== 0 && !currUser.bank_information) {
        //     deleteFile(path);
        //     throw new HttpException(
        //         'Cannot create a paid dataset without setting up bank information',
        //         HttpStatus.BAD_REQUEST,
        //     );
        // }

        if (mimetype !== 'application/zip') {
            deleteFile(path);
            throw new HttpException(
                'Unsupported file format. Only zip files are supported.',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (size > MAXIMUM_DATASET_SIZE) {
            deleteFile(path);
            throw new HttpException(
                `File size too big for the selected Payment plan`,
                HttpStatus.BAD_REQUEST,
            );
        }

        const newDataSet = await this.datasetService.create({
            ...body,
            payment_plan: paymentPlan,
            user: currUser,
            src: path,
            size: size,
        });

        if (newDataSet) {
            await this.notificationService.create({
                title: NotificationType.DATASET_CREATED,
                describtion: `A dataset with an Id: ${newDataSet.id} created`,
                to: currUser,
                from: null,
            });

            const admins = await this.userService.findAdmins();
            admins.forEach(async (adminUser) => {
                await this.notificationService.create({
                    title: NotificationType.DATASET_PENDING_APPROVAL,
                    describtion: `A new Dataset with id: ${newDataSet.id} pending approval from Admins`,
                    to: adminUser,
                    from: null,
                });
            });
        }
        newDataSet.user.password = null;
        return newDataSet;
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
            'datatype',
            new EnumValidationPipe(
                DataTypeFilter,
                `datatype input has to be one of: [${enumToString(
                    DataTypeFilter,
                )}]`,
            ),
        )
        datatype?: DataTypeFilter,
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
        @Query(
            'status',
            new EnumValidationPipe(
                DatasetStatus,
                `Status must be either of [${enumToString(DatasetStatus)}]`,
            ),
        )
        status?: DatasetStatus,
    ) {
        const currUser = await this.userService.findById(user.userId);
        if (!currUser)
            throw new HttpException('User not fount', HttpStatus.NOT_FOUND);

        if (status && status !== DatasetStatus.ACCEPTED) {
            if (!owner || (owner && owner !== Owner.ME)) {
                throw new HttpException(
                    'Not authorized to access Datasets that are not public and are not yours',
                    HttpStatus.UNAUTHORIZED,
                );
            }
        }

        return this.datasetService.find(
            page,
            limit,
            search,
            datatype,
            sortByDate,
            sortByUpvotes,
            sortByDownvotes,
            owner === Owner.ME ? user.userId : null,
            status,
        );
    }

    @Get(':id')
    findById(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<Partial<Dataset>> {
        return this.datasetService.findById(id);
    }

    @Get(':id/upvote')
    async upvote(
        @Param('id', ParseUUIDPipe) datasetId: string,
        @User() user: AuthorizedUserData,
    ): Promise<Partial<Dataset>> {
        const currUser: UserEntity = await this.userService.findById(
            user.userId,
        );

        const dataset = await this.datasetService.findById(datasetId);
        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);

        // let hasPurchased = false;
        // if (dataset.purchased_by) {
        //     hasPurchased =
        //         dataset.purchased_by.filter(
        //             (ownerUser) => ownerUser.id === user.userId,
        //         ).length > 0;
        // }

        // if (dataset.price.toString() !== 'ብር0.00' && !hasPurchased)
        //     throw new HttpException(
        //         'Cannot upvote an unpurchased dataset',
        //         HttpStatus.UNAUTHORIZED,
        //     );

        const toUser = dataset.user;
        const upvotedDataset = await this.datasetService.upvote(
            datasetId,
            currUser,
        );

        if (upvotedDataset && toUser && currUser) {
            await this.notificationService.create({
                title: NotificationType.DATASET_UPDATED,
                to: toUser,
                from: currUser,
                describtion: `User with id=${currUser.id} upvoted your dataset with id=${upvotedDataset.id}`,
            });
        }

        const { src, ...rest } = upvotedDataset;
        return rest;
    }

    @Get(':id/downvote')
    async downvote(
        @Param('id', ParseUUIDPipe) datasetId: string,
        @User() user: AuthorizedUserData,
    ): Promise<Partial<Dataset>> {
        const currUser: UserEntity = await this.userService.findById(
            user.userId,
        );
        const dataset = await this.datasetService.findById(datasetId);
        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);

        // let hasPurchased = false;
        // if (dataset.purchased_by) {
        //     hasPurchased =
        //         dataset.purchased_by.filter(
        //             (ownerUser) => ownerUser.id === user.userId,
        //         ).length > 0;
        // }

        // if (dataset.price.toString() !== 'ብር0.00' && !hasPurchased)
        //     throw new HttpException(
        //         'Cannot upvote an unpurchased dataset',
        //         HttpStatus.UNAUTHORIZED,
        //     );

        const toUser = dataset.user;
        const downvotedDataset = await this.datasetService.downvote(
            datasetId,
            currUser,
        );

        if (downvotedDataset && toUser && currUser) {
            await this.notificationService.create({
                title: NotificationType.DATASET_DOWNVOTED,
                to: toUser,
                from: currUser,
                describtion: `User with id=${currUser.id} downvoted your dataset with id=${downvotedDataset.id}`,
            });
        }
        const { src, ...rest } = downvotedDataset;
        return rest;
    }

    @Public()
    @Get(':id/download')
    async downloadDataset(
        @User() user: AuthorizedUserData,
        @Param('id', ParseUUIDPipe) id: string,
        @Res() res: Response,
    ) {
        const dataset = await this.datasetService.findById(id);

        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);

        if (dataset.status !== DatasetStatus.ACCEPTED)
            throw new HttpException(
                'Cannot download a dataset that is not Accepted yet',
                HttpStatus.BAD_REQUEST,
            );

        let hasPurchased = false;
        // if (dataset.purchased_by) {
        //     hasPurchased =
        //         dataset.purchased_by.filter(
        //             (ownerUser) => ownerUser.id === user.userId,
        //         ).length > 0;
        // }
        // if (!hasPurchased && !user.role.includes(UserRole.ADMIN))
        //     throw new HttpException(
        //         'Cannot download an unpurchased dataset',
        //         HttpStatus.BAD_REQUEST,
        //     );

        const datasetFileName = `[${dataset.title}] by user: [${dataset?.user?.username}].zip`;

        const path = dataset.src;
        if (!fs.existsSync(path))
            throw new HttpException(
                `Dataset data not found`,
                HttpStatus.NOT_FOUND,
            );

        const filePath = path;
        const fileStream = fs.createReadStream(filePath);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + datasetFileName,
        );
        fileStream.pipe(res);
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id/accept')
    async accept(@Param('id', ParseUUIDPipe) id: string) {
        const dataset = await this.datasetService.findById(id);
        if (!dataset)
            throw new HttpException('Datset not found', HttpStatus.NOT_FOUND);
        return this.datasetService.update(dataset, {
            status: DatasetStatus.ACCEPTED,
        });
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id/reject')
    async reject(@Param('id', ParseUUIDPipe) id: string) {
        const dataset = await this.datasetService.findById(id);
        if (!dataset)
            throw new HttpException('Datset not found', HttpStatus.NOT_FOUND);
        return this.datasetService.update(dataset, {
            status: DatasetStatus.REJECTED,
        });
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdateDatasetDto,
        @User() user: AuthorizedUserData,
    ) {
        const dataset = await this.datasetService.findById(id);

        if (dataset.user.id !== user.userId)
            throw new HttpException(
                'User unauthorized',
                HttpStatus.UNAUTHORIZED,
            );

        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);

        if (dataset.status !== DatasetStatus.PENDING)
            throw new HttpException(
                'Dataset can only be updated in Pending status',
                HttpStatus.BAD_REQUEST,
            );

        return this.datasetService.update(dataset, body);
    }

    @Delete(':id')
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: AuthorizedUserData,
    ) {
        const dataset = await this.datasetService.findById(id);
        if (!dataset)
            throw new HttpException('Dataset not found', HttpStatus.NOT_FOUND);
        if (dataset.user.id !== user.userId)
            throw new HttpException(
                'User not authorized',
                HttpStatus.UNAUTHORIZED,
            );
        // if (dataset.status === DatasetStatus.ACCEPTED)
        //     throw new HttpException(
        //         'Cannot delete an accepted dataset',
        //         HttpStatus.BAD_REQUEST,
        //     );
        return this.datasetService.remove(dataset);
    }
}
