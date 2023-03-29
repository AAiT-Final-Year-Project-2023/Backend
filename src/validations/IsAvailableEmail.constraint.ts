import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { UserService } from 'src/user/user.service';

@ValidatorConstraint({ name: 'IsAvailableEmail', async: true })
@Injectable()
export class IsAvailableEmailConstraint
    implements ValidatorConstraintInterface
{
    constructor(private userService: UserService) {}

    async validate(email: string, args: ValidationArguments) {
        const user = await this.userService.findByEmail(email);
        return user ? false : true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Email is already in use';
    }
}
