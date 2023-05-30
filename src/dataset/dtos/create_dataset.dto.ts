import {
    ArrayMaxSize,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { DataType } from 'src/common/defaults';
import { IsValidPaymentPlan } from 'src/decorators/IsValidPaymentPlan.decorator';

export class CreateDatasetDto {
    @IsNotEmpty()
    @IsUUID()
    @IsValidPaymentPlan()
    payment_plan: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(25)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    description: string;

    @IsArray()
    @IsString({ each: true })
    @MaxLength(30, { each: true })
    @ArrayMaxSize(10)
    labels: string[];

    @IsEnum(DataType)
    datatype: DataType;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    price: number;
}
