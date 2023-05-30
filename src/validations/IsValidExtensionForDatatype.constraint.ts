import { Injectable } from '@nestjs/common';
import { FileExtension } from 'src/file_extension/file_extension.entity';
import { FileExtensionService } from 'src/file_extension/file_extension.service';
import {
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
} from 'class-validator';
import { CreateRequestPostDto } from 'src/requestpost/dtos/create_requestpost.dto';

@ValidatorConstraint({ name: 'IsSupportedFileExtension', async: true })
@Injectable()
export class IsValidExtensionForDatatypeConstraint
    implements ValidatorConstraintInterface
{
    constructor(private fileExtensionService: FileExtensionService) {}

    async validate(extensions: string[], args: ValidationArguments) {
        const object = args.object as CreateRequestPostDto;

        const supportedExtensionsTypes: FileExtension[] =
            await this.fileExtensionService.find();
        const validExtensionsForType: string[] = [];
        supportedExtensionsTypes.forEach((supportedExtensionType) => {
            if (object.datatype === supportedExtensionType.data_type) {
                validExtensionsForType.push(supportedExtensionType.extension);
            }
        });

        for (const extension of extensions) {
            if (!validExtensionsForType.includes(extension)) return false;
        }

        return true;
    }

    defaultMessage(args: ValidationArguments) {
        const object = args.object as CreateRequestPostDto;
        return `Unsupported file extension entered for the datatype '${object.datatype}'`;
    }
}
