import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsValidPaymentPlanConstraint } from 'src/validations/IsValidPaymentPlan.constraint';

export function IsValidPaymentPlan(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidPaymentPlanConstraint,
        });
    };
}
