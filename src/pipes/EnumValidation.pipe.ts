import {
    PipeTransform,
    Injectable,
    HttpException,
    HttpStatus,
} from '@nestjs/common';

@Injectable()
export class EnumValidationPipe<T> implements PipeTransform<string, T> {
    constructor(
        private readonly enumType: T,
        private readonly errorMessage: string,
    ) {
        this.enumType = enumType;
    }

    transform(value: string): T {
        if (!value) return value as T;
        if (!Object.values(this.enumType).includes(value)) {
            throw new HttpException(this.errorMessage, HttpStatus.BAD_REQUEST);
        }
        return value as T;
    }
}
