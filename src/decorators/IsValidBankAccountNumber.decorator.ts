import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsValidBankAccountNumberConstraint } from 'src/validations/IsValidBankAccountNumber.constraint';

export function IsValidBankAccountNumber(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidBankAccountNumberConstraint,
        });
    };
}
