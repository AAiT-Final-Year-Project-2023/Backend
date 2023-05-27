import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsValidBankIdConstraint } from 'src/validations/IsValidBankId.constraint';

export function IsValidBankId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidBankIdConstraint,
        });
    };
}
