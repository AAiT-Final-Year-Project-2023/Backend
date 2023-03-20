import {
    IsAlpha,
    IsEmail,
    IsNotEmpty,
    IsStrongPassword,
    MaxLength,
    MinLength,
} from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(18)
    @IsAlpha()
    username: string;

    @IsEmail()
    @IsNotEmpty()
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
