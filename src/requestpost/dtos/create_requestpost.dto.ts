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
    Length,
    MaxLength,
    MinLength,
} from 'class-validator';
import { DataType } from 'src/common/defaults';
import { IsSupportedFileExtension } from 'src/decorators/IsSupportedFileExtension.decorator';
import { IsValidExtensionForDatatype } from 'src/decorators/IsValidExtensionForDatatype.decorator';
import { IsValidPaymentPlan } from 'src/decorators/IsValidPaymentPlan.decorator';

export class CreateRequestPostDto {
    @IsNotEmpty()
    @IsNumber()
    @IsValidPaymentPlan()
    payment_plan: number;

    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(50)
    title: string;

    @IsString()
    @IsNotEmpty()
    @Length(50, 500)
    description: string;

    // ?? WHYYYYY
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
