import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset } from './dataset.entity';
import { DatasetService } from './dataset.service';
import { DatasetController } from './dataset.controller';
import { UserModule } from 'src/user/user.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AuthorizedUserData } from 'src/common/interfaces';
import { PaymentplanModule } from 'src/paymentplan/paymentplan.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Dataset]),
        UserModule,
        PaymentplanModule,
        NotificationModule,
        MulterModule.registerAsync({
            useFactory: async () => {
                return {
                    dest: '../uploads/',
                    storage: diskStorage({
                        destination: (req, file, cb) => {
                            const folderPath = `./uploads/datasets`;
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
            },
        }),
    ],
    controllers: [DatasetController],
    providers: [DatasetService],
})
export class DatasetModule {}
