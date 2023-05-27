import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dataset } from './dataset.entity';
import { DatasetService } from './dataset.service';
import { DatasetController } from './dataset.controller';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [TypeOrmModule.forFeature([Dataset]), UserModule],
    controllers: [DatasetController],
    providers: [DatasetService],
})
export class DatasetModule {}
