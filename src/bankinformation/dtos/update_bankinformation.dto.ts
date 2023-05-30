import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateBankinformationDto } from './create_bankinformation.dto';
import { IsValidBankId } from 'src/decorators/IsValidBankId.decorator';
import { IsValidBankAccountNumber } from 'src/decorators/IsValidBankAccountNumber.decorator';

export class UpdateBankinformationDto extends PartialType(
    CreateBankinformationDto,
) {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    account_name: string;

    @IsNotEmpty()
    @IsString()
    @IsValidBankAccountNumber()
    account_number: string;

    @IsNotEmpty()
    @IsString()
    @IsValidBankId()
    bank_id: string;
}
