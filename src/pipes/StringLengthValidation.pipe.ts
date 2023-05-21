import {
    HttpException,
    HttpStatus,
    Injectable,
    PipeTransform,
} from '@nestjs/common';

@Injectable()
export class StringLengthValidationPipe implements PipeTransform {
    constructor(
        private readonly maxLength: number,
        private readonly errorMessage: string,
    ) {}

    transform(value: string): string {
        if (!value) return value;
        if (value.length > this.maxLength) {
            throw new HttpException(this.errorMessage, HttpStatus.BAD_REQUEST);
        }
        return value;
    }
}
