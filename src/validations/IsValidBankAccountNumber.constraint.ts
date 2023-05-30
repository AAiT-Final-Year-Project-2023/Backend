import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { PaymentService } from 'src/payment/payment.service';

@ValidatorConstraint({ name: 'IsValidBankAccountNumber', async: true })
@Injectable()
export class IsValidBankAccountNumberConstraint
    implements ValidatorConstraintInterface
{
    constructor(private paymentService: PaymentService) {}

    async validate(account_number: string, args: ValidationArguments) {
        const banks = await this.paymentService.getBanks();
        const selectedBankId = args.object['bank_id'];
        if (!selectedBankId)
            throw new HttpException(
                'Entered bank id not supported',
                HttpStatus.BAD_REQUEST,
            );
        const selectedBank = banks.data.filter(
            (bank) => bank.id === selectedBankId,
        )[0];
        if (!selectedBank)
            throw new HttpException(
                'Entered bank id not supported',
                HttpStatus.BAD_REQUEST,
            );
        const length = selectedBank['acct_length'];
        args.constraints[1] = length;
        args.constraints[0] = selectedBank.name;
        return account_number.length === length;
    }

    defaultMessage(args: ValidationArguments) {
        const bank_name = args.constraints[0];
        const bank_account_number_length = args.constraints[1];
        return `Entered account number: ${args.value} of length ${args.value.length}, is invalid for the entered bank: ${bank_name}. The length has to be ${bank_account_number_length}.`;
    }
}
