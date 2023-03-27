import {
    ArrayMaxSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
    Length,
    MaxLength,
    MinLength,
} from 'class-validator';
import { DataType } from 'src/common/defaults';
import { IsValidPaymentPlan } from 'src/decorators/IsValidPaymentPlan.decorator';

export class UpdateRequestPostDto {
    @IsOptional()
    @IsNotEmpty()
    @IsUUID()
    @IsValidPaymentPlan()
    payment_plan: string;

    @IsOptional()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(50)
    title: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Length(50, 500)
    description: string;

    // ?? WHYYYYY
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(30, { each: true })
    @ArrayMaxSize(10)
    labels: string[];

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @Length(50, 500)
    guidelines: string;

    @IsOptional()
    @IsEnum(DataType)
    datatype: DataType;

    // PROBLEM
    @IsOptional()
    extensions: string[];

    // In KBs
    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    data_size: number;

    // In birr
    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    payment: number;
}
