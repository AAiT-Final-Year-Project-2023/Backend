import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlan } from './paymentplan.entity';
import { PaymentplansService } from './paymentplans.service';

@Module({
    imports: [TypeOrmModule.forFeature([PaymentPlan])],
    providers: [PaymentplansService],
    controllers: [],
})
export class PaymentplansModule {}
