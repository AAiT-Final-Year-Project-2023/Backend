import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// modules
import { UsersModule } from './user/users.module';
import { PaymentplansModule } from './paymentplan/paymentplans.module';
import { DataModule } from './data/data.module';
import { NotificationModule } from './notification/notification.module';
import { BankinformationModule } from './bankinformation/bankinformation.module';
import { DatasetModule } from './dataset/dataset.module';
import { ContributionModule } from './contribution/contribution.module';
import { RequestpostModule } from './requestpost/requestpost.module';
// entities
import { User } from './user/user.entity';
import { PaymentPlan } from './paymentplan/paymentplan.entity';
import { Data } from './data/data.entity';
import { Notification } from './notification/notification.entity';
import { BankInformation } from './bankinformation/bankinformation.entity';
import { Dataset } from './dataset/dataset.entity';
import { Contribution } from './contribution/contribution.entity';
import { RequestPost } from './requestpost/requestpost.entity';

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
                ],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        PaymentplansModule,
        DataModule,
        NotificationModule,
        BankinformationModule,
        DatasetModule,
        ContributionModule,
        RequestpostModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
