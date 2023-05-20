import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateBankinformationDto } from './create_bankinformation.dto';

export class UpdateBankinformationDto extends PartialType(
    CreateBankinformationDto,
) {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    chapa_info: string;
}
