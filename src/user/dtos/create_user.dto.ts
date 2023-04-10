import {
    IsAlpha,
    IsEmail,
    IsNotEmpty,
    IsStrongPassword,
    MaxLength,
    MinLength,
} from 'class-validator';
import { IsAvailableEmail } from 'src/decorators/IsAvailableEmail.decorator';
import { IsAvailableUsername } from 'src/decorators/IsAvailableUsername.decorator';
import { IsValidEmail } from 'src/decorators/IsValidEmail.decorator';

export class CreateUserDto {
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(18)
    @IsAlpha()
    @IsAvailableUsername()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    // @IsValidEmail()
    @IsAvailableEmail()
    email: string;

    @MaxLength(18)
    @IsStrongPassword({
        minLength: 6,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1,
    })
    password: string;
}
