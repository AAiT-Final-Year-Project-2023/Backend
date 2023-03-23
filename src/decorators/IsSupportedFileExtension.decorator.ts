import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsSupportedFileExtensionConstraint } from 'src/validations/IsSupportedFileExtension.constraint';

export function IsSupportedFileExtension(
    validationOptions?: ValidationOptions,
) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsSupportedFileExtensionConstraint,
        });
    };
}
