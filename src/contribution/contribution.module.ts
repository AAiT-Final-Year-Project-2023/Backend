import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribution } from './contribution.entity';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Contribution])],
    controllers: [ContributionController],
    providers: [ContributionService],
})
export class ContributionModule {}
