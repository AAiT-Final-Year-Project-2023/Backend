import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contribution } from './contribution.entity';
import { ContributionService } from './contribution.service';
import { ContributionController } from './contribution.controller';
import { DataModule } from 'src/data/data.module';

@Module({
    imports: [TypeOrmModule.forFeature([Contribution]), DataModule],
    controllers: [ContributionController],
    providers: [ContributionService],
    exports: [ContributionService],
})
export class ContributionModule {}
