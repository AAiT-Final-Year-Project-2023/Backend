import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateBankinformationDto } from './create_bankinformation.dto';
import { IsValidBankId } from 'src/decorators/IsValidBankId.decorator';

export class UpdateBankinformationDto extends PartialType(
    CreateBankinformationDto,
) {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    account_name: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    account_number: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @IsValidBankId()
    bank_id: string;
}
