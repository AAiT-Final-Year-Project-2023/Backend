import { IsNotEmpty, IsString } from 'class-validator';
import { IsValidBankId } from 'src/decorators/IsValidBankId.decorator';

export class CreateBankinformationDto {
    @IsNotEmpty()
    @IsString()
    account_name: string;

    @IsNotEmpty()
    @IsString()
    account_number: string;

    @IsNotEmpty()
    @IsString()
    @IsValidBankId()
    bank_id: string;
}
