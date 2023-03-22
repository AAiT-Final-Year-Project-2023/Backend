import {
    ArrayMaxSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsPositive,
    IsString,
    Max,
    MaxLength,
} from 'class-validator';
import { DataType } from 'src/common/defaults';

export class CreateDatasetDto {
    @IsString()
    @IsNotEmpty()
    @IsString()
    @Max(25)
    title: string;

    @IsString()
    @IsNotEmpty()
    @IsString()
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
