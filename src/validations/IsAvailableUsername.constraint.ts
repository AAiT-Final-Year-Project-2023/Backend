import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { UserService } from 'src/user/user.service';

@ValidatorConstraint({ name: 'IsAvailableUsername', async: true })
@Injectable()
export class IsAvailableUsernameConstraint
    implements ValidatorConstraintInterface
{
    constructor(private userService: UserService) {}

    async validate(username: string, args: ValidationArguments) {
        const user = await this.userService.findByUsername(username);
        return user ? false : true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Username is taken';
    }
}
