import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBankinformationDto {
    @IsNotEmpty()
    @IsString()
    chapa_info: string
}