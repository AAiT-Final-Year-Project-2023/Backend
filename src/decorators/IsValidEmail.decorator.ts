import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsValidEmailConstraint } from 'src/validations/IsValidEmail.constraint';

export function IsValidEmail(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidEmailConstraint,
        });
    };
}
