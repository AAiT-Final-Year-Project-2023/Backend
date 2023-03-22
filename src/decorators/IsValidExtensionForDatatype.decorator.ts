import {
    registerDecorator,
    ValidationOptions,
} from 'class-validator';
import { IsValidExtensionForDatatypeConstraint } from 'src/validations/IsValidExtensionForDatatype.constraint';

export function IsValidExtensionForDatatype(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidExtensionForDatatypeConstraint,
        });
    };
}
