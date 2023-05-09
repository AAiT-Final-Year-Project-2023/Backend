import {
    ArrayMaxSize,
    IsArray,
    IsDateString,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    IsUUID,
    Length,
    MaxLength,
    MinLength,
} from 'class-validator';
import { DataType } from 'src/common/defaults';
import { IsValidPaymentPlan } from 'src/decorators/IsValidPaymentPlan.decorator';
import { IsSupportedFileExtension } from 'src/decorators/IsSupportedFileExtension.decorator';
import { IsValidExtensionForDatatype } from 'src/decorators/IsValidExtensionForDatatype.decorator';
import { IsValidRequestPostDataSize } from 'src/decorators/IsValidRequestPostDataSize.decorator';

export class CreateRequestPostDto {
    @IsNotEmpty()
    @IsUUID()
    @IsValidPaymentPlan()
    payment_plan: string;

    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(50)
    title: string;

    @IsString()
    @IsNotEmpty()
    @Length(50, 500)
    description: string;

    @IsArray()
    @IsString({ each: true })
    @MaxLength(30, { each: true })
    @ArrayMaxSize(10)
    labels: string[];

    @IsString()
    @IsNotEmpty()
    @Length(50, 500)
    guidelines: string;

    @IsEnum(DataType)
    datatype: DataType;

    @IsSupportedFileExtension()
    @IsValidExtensionForDatatype()
    extensions: string[];

    // In KBs
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    @IsValidRequestPostDataSize()
    data_size: number;

    // In birr
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    payment: number;

    @IsNotEmpty()
    @IsDateString()
    deadline: string;
}
