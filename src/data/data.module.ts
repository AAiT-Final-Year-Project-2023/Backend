import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Data } from './data.entity';
import { DataService } from './data.service';
import { DataController } from './data.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Data])],
    controllers: [DataController],
    providers: [DataService],
    exports: [DataService],
})
export class DataModule {}
