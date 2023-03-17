import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PaymentplansModule } from './paymentplans/paymentplans.module';
import { DataModule } from './data/data.module';
import { NotificationModule } from './notification/notification.module';
import { BankinformationModule } from './bankinformation/bankinformation.module';
import { DatasetModule } from './dataset/dataset.module';
import { ContributionModule } from './contribution/contribution.module';
import { RequestpostModule } from './requestpost/requestpost.module';

@Module({
  imports: [UsersModule, PaymentplansModule, DataModule, NotificationModule, BankinformationModule, DatasetModule, ContributionModule, RequestpostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
