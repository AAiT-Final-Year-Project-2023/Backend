import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentPlan } from './paymentplan.entity';
import { PaymentplansService } from './paymentplan.service';
import { PaymentplanController } from './paymentplan.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PaymentPlan])],
    providers: [PaymentplansService],
    controllers: [PaymentplanController],
    exports: [PaymentplansService],
})
export class PaymentplanModule {}
