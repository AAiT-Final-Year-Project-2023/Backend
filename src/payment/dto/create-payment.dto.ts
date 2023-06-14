import { IsAlpha, IsPhoneNumber, MaxLength } from 'class-validator';

export class CreatePaymentDto {
    @IsPhoneNumber()
    phone: string;
}
