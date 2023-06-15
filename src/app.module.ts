import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PaymentplanModule } from './paymentplan/paymentplan.module';
import { DataModule } from './data/data.module';
import { NotificationModule } from './notification/notification.module';
import { BankinformationModule } from './bankinformation/bankinformation.module';
import { DatasetModule } from './dataset/dataset.module';
import { ContributionModule } from './contribution/contribution.module';
import { RequestpostModule } from './requestpost/requestpost.module';
import { FileExtensionModule } from './file_extension/file_extension.module';
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
import { IsAvailableEmailConstraint } from './validations/IsAvailableEmail.constraint';
import { IsAvailableUsernameConstraint } from './validations/IsAvailableUsername.constraint';
import { RolesGuard } from './guards/role.guard';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { UserExistsConstraint } from './validations/UserExists.constraint';
import { IsValidEmailConstraint } from './validations/IsValidEmail.constraint';
import { RequestPostExistsConstraint } from './validations/RequestPostExists.constraint';
import { ContributionUploadMiddleware } from './middlewares/ContributionUploadMiddleware.middleware';
import { IsValidRequestPostDataSizeConstraint } from './validations/IsValidRequestPostDataSize.constraint';
import { ChapaModule } from 'chapa-nestjs';
import { PaymentModule } from './payment/payment.module';
import { Payment } from './payment/payment.entity';
import { IsFutureDateConstraint } from './validations/IsFutureDate.constraint';
import { IsValidBankIdConstraint } from './validations/IsValidBankId.constraint';
import { IsValidBankAccountNumberConstraint } from './validations/IsValidBankAccountNumber.constraint';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
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
                    Payment,
                ],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        ChapaModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                secretKey: configService.get('PRIVATE_CHAPA_API_KEY'),
            }),
        }),
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    service: 'gmail',
                    port: 587,
                    starttls: {
                        enable: true,
                    },
                    secureConnection: true,
                    auth: {
                        user: configService.get<'string'>('EMAIL_USER'),
                        pass: configService.get<'string'>('EMAIL_PASSWORD'),
                    },
                },
                template: {
                    dir: process.cwd() + '/src/templates/',
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
            inject: [ConfigService],
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads',
        }),
        AuthModule,
        UserModule,
        PaymentplanModule,
        DataModule,
        NotificationModule,
        BankinformationModule,
        DatasetModule,
        ContributionModule,
        RequestpostModule,
        FileExtensionModule,
        EmailModule,
        PaymentModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        EmailService,
        IsSupportedFileExtensionConstraint,
        IsValidExtensionForDatatypeConstraint,
        IsValidPaymentPlanConstraint,
        IsAvailableEmailConstraint,
        IsAvailableUsernameConstraint,
        UserExistsConstraint,
        RequestPostExistsConstraint,
        IsValidEmailConstraint,
        IsValidRequestPostDataSizeConstraint,
        IsFutureDateConstraint,
        IsValidBankIdConstraint,
        IsValidBankAccountNumberConstraint,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(ContributionUploadMiddleware)
            .forRoutes('requestpost/:id/contribution/upload');
    }
}
