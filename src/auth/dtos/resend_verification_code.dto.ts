import { IsEmail, IsNotEmpty } from 'class-validator';
import { IsValidEmail } from 'src/decorators/IsValidEmail.decorator';

export class ResendVerificationCodeDto {
    @IsEmail()
    // @IsValidEmail()
    @IsNotEmpty()
    email: string;
}
