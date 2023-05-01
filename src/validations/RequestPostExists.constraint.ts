import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { RequestpostService } from 'src/requestpost/requestpost.service';

@ValidatorConstraint({ name: 'RequestPostExists', async: true })
@Injectable()
export class RequestPostExistsConstraint
    implements ValidatorConstraintInterface
{
    constructor(private requestPostService: RequestpostService) {}

    async validate(requestPostId: string, args: ValidationArguments) {
        const requestPost = await this.requestPostService.findById(
            requestPostId,
        );
        return requestPost !== null;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Request Post does not exist';
    }
}
