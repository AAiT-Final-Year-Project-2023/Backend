import { Module } from '@nestjs/common';
import { BankinformationService } from './bankinformation.service';

@Module({
  providers: [BankinformationService]
})
export class BankinformationModule {}
