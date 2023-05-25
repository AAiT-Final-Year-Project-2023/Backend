import {
    Body,
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Put,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { UserRole } from 'src/common/defaults';
import { Roles } from 'src/decorators/roles.decorator';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthorizedUserData } from 'src/common/interfaces';
import { User } from 'src/decorators/CurrentUser.decorator';
import { User as UserEntity } from './user.entity';
import { existsSync, unlinkSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import { UpdateUserDto } from './dtos/update_user.dto';

@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private configService: ConfigService,
    ) {}

    @Roles(UserRole.ADMIN)
    @Put('make-admin/:id')
    async makeUserAdmin(@Param('id', ParseUUIDPipe) userId: string) {
        let user = await this.userService.findById(userId);
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const roles = user.roles;

        if (roles.includes(UserRole.ADMIN)) {
            return 'User already is an Admin';
        }
        roles.push(UserRole.ADMIN);
        let updatedUser = await this.userService.update(userId, {
            roles: roles,
        });
        return 'User given Admin privilege';
    }

    @Put('edit_profile')
    async editProfile(
        @Body() body: UpdateUserDto,
        @User() user: AuthorizedUserData,
    ) {
        return await this.userService.update(user.userId, body);
    }

    @Post('upload_profile_image')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/profile_images',
                filename: (req, file, cb) => {
                    const user = req.user as AuthorizedUserData;
                    const filename = `${Date.now()}-${user.userId}-${
                        file.originalname
                    }`;
                    return cb(null, filename);
                },
            }),
            limits: {
                fileSize: 1024 * 1024 * 1, // 1MB,
                files: 1,
            },
            fileFilter: (req, file, cb) => {
                if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                    return cb(
                        new HttpException(
                            'Invalid image format. Must be one of: [jpg, jpeg, png]',
                            HttpStatus.BAD_REQUEST,
                        ),
                        false,
                    );
                }
                if (file.size > 1024 * 1024 * 1) {
                    return cb(
                        new HttpException(
                            'Image size too big. Maximum size allowed is: 1 MB',
                            HttpStatus.BAD_REQUEST,
                        ),
                        false,
                    );
                }
                cb(null, true);
            },
        }),
    )
    async uploadProfileImage(
        @UploadedFile() file: Express.Multer.File,
        @User() user: AuthorizedUserData,
    ) {
        const currentUser: UserEntity = await this.userService.findById(
            user.userId,
        );
        if (currentUser.image) {
            const oldImageDestination = `${file.destination}/${currentUser.image}`;
            if (existsSync(oldImageDestination))
                unlinkSync(oldImageDestination);
        }
        try {
            await this.userService.update(user.userId, {
                image: file.filename,
            });
        } catch (e) {
            const newImageDestination = `${file.destination}/${file.filename}`;
            if (existsSync(newImageDestination))
                unlinkSync(newImageDestination);
            throw new HttpException(
                'Error occured while uploading your profile image',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
        return {
            url: `http://${this.configService.get<string>(
                'HOST',
            )}:${this.configService.get<string>(
                'PORT',
            )}/uploads/profile_images/${file.path}`,
        };
    }

    @Delete()
    async deleteProfileImage(@User() user: AuthorizedUserData) {
        return this.userService.update(user.userId, {
            image: '',
        });
    }
}
