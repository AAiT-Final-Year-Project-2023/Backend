import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsFutureDate', async: true })
@Injectable()
export class IsFutureDateConstraint
    implements ValidatorConstraintInterface
{
    async validate(value: string, args: ValidationArguments) {
       const date = new Date(value);
       return date > new Date();
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} must be a future date`;
    }
}
