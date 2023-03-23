import { Optional } from '@nestjs/common';
import {
    IsString,
    IsNotEmpty,
    IsNumber,
    MaxLength,
    Min,
    IsPositive,
    Max,
    IsOptional,
} from 'class-validator';

export class CreatePaymentplanDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    disk_size: number;

    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount: number;
}
