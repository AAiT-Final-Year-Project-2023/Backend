import { IsAlpha, IsAlphanumeric, IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreatePaymentplanDto {

    @IsNotEmpty()
    @IsString()
    @IsAlpha()
    title: string

    @IsNotEmpty()
    @IsString()
    @IsAlphanumeric()
    description: string

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    price: number
}