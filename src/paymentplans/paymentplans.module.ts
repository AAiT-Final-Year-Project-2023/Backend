import { Module } from '@nestjs/common';
import { PaymentplansService } from './paymentplans.service';

@Module({
  providers: [PaymentplansService],
  controllers: []
})
export class PaymentplansModule {}
