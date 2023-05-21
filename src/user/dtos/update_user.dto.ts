import {
    IsAlpha,
    IsEmail,
    IsNotEmpty,
    IsOptional,
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
}
