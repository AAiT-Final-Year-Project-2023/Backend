import { Module } from '@nestjs/common';
import { RequestpostController } from './requestpost.controller';
import { RequestpostService } from './requestpost.service';

@Module({
  controllers: [RequestpostController],
  providers: [RequestpostService]
})
export class RequestpostModule {}
