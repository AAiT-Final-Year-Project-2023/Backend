import { registerDecorator, ValidationOptions } from 'class-validator';
import { RequestPostExistsConstraint } from 'src/validations/RequestPostExists.constraint';

export function RequestPostExists(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: RequestPostExistsConstraint,
        });
    };
}
