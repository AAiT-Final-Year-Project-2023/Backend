import { IsStrongPassword, MaxLength } from 'class-validator';

export class ChangePasswordDto {
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
