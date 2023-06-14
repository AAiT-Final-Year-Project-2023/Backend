import {
    ArrayMaxSize,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
} from 'class-validator';
import { DataType } from 'src/common/defaults';

export class UpdateDatasetDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(25)
    title: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
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

    // @IsOptional()
    // @IsNotEmpty()
    // @IsNumber()
    // @Min(0)
    // price: number;
}
