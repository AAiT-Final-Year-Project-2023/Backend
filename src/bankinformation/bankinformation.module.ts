import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankInformation } from './bankinformation.entity';
import { BankinformationService } from './bankinformation.service';

@Module({
    imports: [TypeOrmModule.forFeature([BankInformation])],
    providers: [BankinformationService],
})
export class BankinformationModule {}
