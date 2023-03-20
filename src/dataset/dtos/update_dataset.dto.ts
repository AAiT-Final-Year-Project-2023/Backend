import {
    ArrayMaxSize,
    IsAlphanumeric,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    MaxLength,
} from 'class-validator';
import { DataType } from 'src/common/defaults';

export class UpdateDatasetDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    @Max(25)
    title: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @IsAlphanumeric()
    @Max(500)
    description: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(30, { each: true })
    @ArrayMaxSize(10)
    labels: string[];

    @IsOptional()
    @IsEnum(DataType)
    datatype: DataType;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    dataset_size: number;

    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    price: number;
}
