import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBankinformationDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    chapa_info: string;
}
