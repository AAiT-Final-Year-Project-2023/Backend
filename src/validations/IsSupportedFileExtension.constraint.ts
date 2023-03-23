import { Injectable } from '@nestjs/common';
import { FileExtension } from 'src/file_extension/file_extension.entity';
import { FileExtensionService } from 'src/file_extension/file_extension.service';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsSupportedFileExtension', async: true })
@Injectable()
export class IsSupportedFileExtensionConstraint
    implements ValidatorConstraintInterface
{
    constructor(private fileExtensionService: FileExtensionService) {}

    async validate(extensions: string[], args: ValidationArguments) {
        const supportedExtensionsTypes: FileExtension[] =
            await this.fileExtensionService.find();
        let supportedFileExtensions: string[] = [];
        supportedExtensionsTypes.forEach((supportedExtensionType) =>
            supportedFileExtensions.push(supportedExtensionType.extension),
        );

        for (let extension of extensions) {
            if (!supportedFileExtensions.includes(extension)) return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Unsupported file extension entered';
    }
}
