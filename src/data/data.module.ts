import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Data } from './data.entity';
import { DataService } from './data.service';

@Module({
    imports: [TypeOrmModule.forFeature([Data])],
    controllers: [],
    providers: [DataService],
})
export class DataModule {}
