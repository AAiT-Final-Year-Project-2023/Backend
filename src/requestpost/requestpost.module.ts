import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestPost } from './requestpost.entity';
import { RequestpostService } from './requestpost.service';
import { RequestpostController } from './requestpost.controller';

@Module({
    imports: [TypeOrmModule.forFeature([RequestPost])],
    controllers: [RequestpostController],
    providers: [RequestpostService],
})
export class RequestpostModule {}
