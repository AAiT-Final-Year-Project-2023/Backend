import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankInformation } from './bankinformation.entity';
import { BankinformationService } from './bankinformation.service';
import { BankinformationController } from './bankinformation.controller';
import { PaymentModule } from 'src/payment/payment.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([BankInformation]), PaymentModule, UserModule],
    providers: [BankinformationService],
    controllers: [BankinformationController],
})
export class BankinformationModule {}
