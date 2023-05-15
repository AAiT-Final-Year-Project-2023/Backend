import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { isValidUUID } from 'src/common/functions';
import { UserService } from 'src/user/user.service';

@ValidatorConstraint({ name: 'UserExists', async: true })
@Injectable()
export class UserExistsConstraint implements ValidatorConstraintInterface {
    constructor(private userService: UserService) {}

    async validate(userId: string, args: ValidationArguments) {
        if (!isValidUUID(userId)) return false;
        const plan = await this.userService.findById(userId);
        return plan !== null;
    }

    defaultMessage(args: ValidationArguments) {
        return 'User does not exist';
    }
}
