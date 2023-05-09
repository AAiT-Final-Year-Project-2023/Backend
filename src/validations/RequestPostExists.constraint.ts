import { Injectable } from '@nestjs/common';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { isValidUUID } from 'src/common/functions';
import { RequestpostService } from 'src/requestpost/requestpost.service';

@ValidatorConstraint({ name: 'RequestPostExists', async: true })
@Injectable()
export class RequestPostExistsConstraint
    implements ValidatorConstraintInterface
{
    constructor(private requestPostService: RequestpostService) {}

    async validate(requestPostId: string, args: ValidationArguments) {
        if (isValidUUID(requestPostId)) {
            const requestPost = await this.requestPostService.findById(
                requestPostId,
            );
            return requestPost !== null;
        }
        return false;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Request Post does not exist';
    }
}
