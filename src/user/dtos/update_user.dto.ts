import {
    IsAlpha,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsStrongPassword,
    MaxLength,
    MinLength,
} from 'class-validator';
import { IsAvailableEmail } from 'src/decorators/IsAvailableEmail.decorator';
import { IsAvailableUsername } from 'src/decorators/IsAvailableUsername.decorator';

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(18)
    @IsAlpha()
    @IsAvailableUsername()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    @IsAvailableEmail()
    email: string;

    @IsOptional()
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
