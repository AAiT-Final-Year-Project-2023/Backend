import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GetBanksResponse, } from 'chapa-nestjs';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { PaymentService } from 'src/payment/payment.service';

@ValidatorConstraint({ name: 'IsValidBankId', async: true })
@Injectable()
export class IsValidBankIdConstraint 
    implements ValidatorConstraintInterface
{
    constructor(private paymentService: PaymentService) {}

    async validate(bank_id: string, args: ValidationArguments) {
        const supportedBanks: GetBanksResponse = await this.paymentService.getBanks();
        if(supportedBanks.data.length === 0) 
            throw new HttpException('Could not get supported banks', HttpStatus.INTERNAL_SERVER_ERROR) 
        supportedBanks.data.forEach(data  => {
            if(bank_id === data.id) return true;
        });
        return false;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Entered bank id not supported';
    }
}

