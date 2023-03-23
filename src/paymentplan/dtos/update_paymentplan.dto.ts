import {
    IsAlpha,
    IsAlphanumeric,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
    Max,
    Min,
} from 'class-validator';

export class UpdatePaymentplanDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @IsAlpha()
    title: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @IsAlphanumeric()
    description: string;

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    disk_size: number;

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    price: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(100)
    discount: number;
}
