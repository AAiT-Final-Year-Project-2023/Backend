import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// modules
import { UserModule } from './user/user.module';
import { PaymentplanModule } from './paymentplan/paymentplan.module';
import { DataModule } from './data/data.module';
import { NotificationModule } from './notification/notification.module';
import { BankinformationModule } from './bankinformation/bankinformation.module';
import { DatasetModule } from './dataset/dataset.module';
import { ContributionModule } from './contribution/contribution.module';
import { RequestpostModule } from './requestpost/requestpost.module';
import { FileExtensionModule } from './file_extension/file_extension.module';

// entities
import { User } from './user/user.entity';
import { PaymentPlan } from './paymentplan/paymentplan.entity';
import { Data } from './data/data.entity';
import { Notification } from './notification/notification.entity';
import { BankInformation } from './bankinformation/bankinformation.entity';
import { Dataset } from './dataset/dataset.entity';
import { Contribution } from './contribution/contribution.entity';
import { RequestPost } from './requestpost/requestpost.entity';
import { FileExtension } from './file_extension/file_extension.entity';
import { IsValidPaymentPlanConstraint } from './validations/IsValidPaymentPlan.constraint';
import { IsSupportedFileExtensionConstraint } from './validations/IsSupportedFileExtension.constraint';
import { IsValidExtensionForDatatypeConstraint } from './validations/IsValidExtensionForDatatype.constraint';

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get<string>('DB_HOST'),
                port: configService.get<number>('DB_PORT'),
                username: configService.get<string>('DB_USERNAME'),
                password: configService.get<string>('DB_PASSWORD'),
                database: configService.get<string>('DB_NAME'),
                entities: [
                    User,
                    PaymentPlan,
                    Data,
                    Notification,
                    BankInformation,
                    Dataset,
                    Contribution,
                    RequestPost,
                    FileExtension,
                ],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        UserModule,
        PaymentplanModule,
        DataModule,
        NotificationModule,
        BankinformationModule,
        DatasetModule,
        ContributionModule,
        RequestpostModule,
        FileExtensionModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        IsSupportedFileExtensionConstraint,
        IsValidExtensionForDatatypeConstraint,
        IsValidPaymentPlanConstraint
    ],
})
export class AppModule {}
