import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { EmailService } from 'src/email/email.service';

@ValidatorConstraint({ name: 'IsValidEmail', async: true })
@Injectable()
export class IsValidEmailConstraint implements ValidatorConstraintInterface {
    constructor(private readonly emailService: EmailService) {}

    async validate(email: string, args: ValidationArguments): Promise<boolean> {
        const response = await this.emailService.isValidEmail(email);
        return response.valid;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Email is invalid';
    }
}
