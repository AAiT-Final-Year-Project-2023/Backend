import {
    ArgumentMetadata,
    BadRequestException,
    ParseBoolPipe,
} from '@nestjs/common';

export class OptionalBooleanPipe extends ParseBoolPipe {
    transform(value: any, metadata: ArgumentMetadata) {
        if (value === undefined) {
            return undefined;
        }
        const result = super.transform(value, metadata);
        if (result === undefined) {
            throw new BadRequestException(
                'Validation failed (boolean string is expected)',
            );
        }
        return result;
    }
}
