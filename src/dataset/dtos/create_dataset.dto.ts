import {
    ArrayMaxSize,
    IsAlpha,
    IsAlphanumeric,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsPositive,
    IsString,
    Max,
    MaxLength,
} from 'class-validator';
import { DataType } from 'src/common/defaults';

export class CreateDatasetDto {
    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    @Max(25)
    title: string;

    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    @Max(500)
    description: string;

    @IsArray()
    @IsString({ each: true })
    @MaxLength(30, { each: true })
    @ArrayMaxSize(10)
    labels: string[];

    @IsEnum(DataType)
    datatype: DataType;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    dataset_size: number;

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    price: number;
}
