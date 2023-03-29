import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsAvailableUsernameConstraint } from 'src/validations/IsAvailableUsername.constraint';

export function IsAvailableUsername(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsAvailableUsernameConstraint,
        });
    };
}
