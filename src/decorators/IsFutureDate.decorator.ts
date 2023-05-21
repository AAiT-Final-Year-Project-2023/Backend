import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsFutureDateConstraint } from 'src/validations/IsFutureDate.constraint';

export function IsFutureDate(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsFutureDateConstraint,
        });
    };
}
