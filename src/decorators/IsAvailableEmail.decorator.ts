import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsAvailableEmailConstraint } from 'src/validations/IsAvailableEmail.constraint';

export function IsAvailableEmail(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsAvailableEmailConstraint,
        });
    };
}
