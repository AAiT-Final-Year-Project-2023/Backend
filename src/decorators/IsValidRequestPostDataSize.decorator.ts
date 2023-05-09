import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsValidRequestPostDataSizeConstraint } from 'src/validations/IsValidRequestPostDataSize.constraint';

export function IsValidRequestPostDataSize(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidRequestPostDataSizeConstraint,
        });
    };
}
