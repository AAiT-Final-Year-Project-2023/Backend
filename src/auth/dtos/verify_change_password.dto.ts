import { IsString, MaxLength } from 'class-validator';

export class VerifyChangePasswordDto {
    @MaxLength(6)
    @IsString()
    code: string;
}
