import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { isValidUUID } from 'src/common/functions';
import { PaymentplansService } from 'src/paymentplan/paymentplan.service';

@ValidatorConstraint({ name: 'IsValidPaymentPlan', async: true })
@Injectable()
export class IsValidPaymentPlanConstraint
    implements ValidatorConstraintInterface
{
    constructor(private paymentPlanService: PaymentplansService) {}

    async validate(payment_plan: string, args: ValidationArguments) {
        if (isValidUUID(payment_plan)) {
            const plan = await this.paymentPlanService.findById(payment_plan);
            return plan !== null;
        }
        return false;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Payment plan does not exist';
    }
}
