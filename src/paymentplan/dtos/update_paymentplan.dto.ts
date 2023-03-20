import {
    IsAlpha,
    IsAlphanumeric,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsPositive,
    IsString,
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
    price: number;
}
