import {
    IsEmail,
    IsNotEmpty,
    IsNumber,
    IsString,
    MaxLength,
} from 'class-validator';
import { IsValidEmail } from 'src/decorators/IsValidEmail.decorator';

export class VerifyUserDto {
    @IsEmail()
    @IsNotEmpty()
    // @IsValidEmail()
    email: string;

    @MaxLength(6)
    @IsString()
    code: string;
}
