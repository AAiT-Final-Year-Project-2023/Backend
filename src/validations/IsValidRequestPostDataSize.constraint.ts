import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { CreateRequestPostDto } from 'src/requestpost/dtos/create_requestpost.dto';
import { PaymentplansService } from 'src/paymentplan/paymentplan.service';
import { isValidUUID } from 'src/common/functions';

@ValidatorConstraint({ name: 'IsValidRequestPostDataSize', async: true })
@Injectable()
export class IsValidRequestPostDataSizeConstraint
    implements ValidatorConstraintInterface
{
    private paymentPlanDiskSize: number;
    constructor(private paymentPlanService: PaymentplansService) {}

    async validate(data_size: number, args: ValidationArguments) {
        const object = args.object as CreateRequestPostDto;
        const paymentPlanId = object.payment_plan;
        if (!isValidUUID(paymentPlanId)) {
            throw new HttpException(
                'payment_plan must be a valid UUID',
                HttpStatus.BAD_REQUEST,
            );
        }
        const paymentPlan = await this.paymentPlanService.findById(
            paymentPlanId,
        );
        if (!paymentPlan) {
            throw new HttpException(
                'Payment Plan does not exist',
                HttpStatus.NOT_FOUND,
            );
        }
        this.paymentPlanDiskSize = paymentPlan.disk_size;

        if (data_size >= paymentPlan.disk_size) {
            return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return `data_size is too large for the chosen Payment Plan data size: ${this.paymentPlanDiskSize}`;
    }
}
