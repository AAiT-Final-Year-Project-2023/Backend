import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestPost } from './requestpost.entity';
import { RequestpostService } from './requestpost.service';
import { RequestpostController } from './requestpost.controller';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { AuthorizedUserData } from 'src/common/interfaces';
import { existsSync, mkdirSync } from 'fs';
import { ContributionModule } from 'src/contribution/contribution.module';
import { ContributionUploadMiddleware } from 'src/middlewares/ContributionUploadMiddleware.middleware';
import { PaymentplanModule } from 'src/paymentplan/paymentplan.module';
import { User } from 'src/user/user.entity';
import { PaymentPlan } from 'src/paymentplan/paymentplan.entity';
import { DataModule } from 'src/data/data.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([RequestPost, User, PaymentPlan]),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (config: ConfigService) => {
                const options = {
                    dest: '../uploads/',
                    storage: diskStorage({
                        destination: (req, file, cb) => {
                            const requestPostId = req.params.id;
                            const folderPath = `./uploads/request_posts/${requestPostId}`;
                            if (!existsSync(folderPath)) {
                                mkdirSync(folderPath, { recursive: true });
                            }
                            cb(null, folderPath);
                        },
                        filename: (req, file, cb) => {
                            const user = req.user as AuthorizedUserData;
                            const filename = `${Date.now()}-${user.userId}-${
                                file.originalname
                            }`;
                            cb(null, filename);
                        },
                    }),
                };
                return options;
            },
            inject: [ConfigService],
        }),
        NotificationModule,
        ContributionModule,
        PaymentplanModule,
        DataModule,
    ],
    controllers: [RequestpostController],
    providers: [RequestpostService, ContributionUploadMiddleware],
    exports: [RequestpostService],
})
export class RequestpostModule {}
