import {
    IsAlpha,
    IsString,
    IsNotEmpty,
    IsNumber,
    IsPositive,
} from 'class-validator';

export class CreatePaymentplanDto {
    @IsNotEmpty()
    @IsString()
    @IsAlpha()
    title: string;

    @IsNotEmpty()
    @IsString()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    price: number;
}
