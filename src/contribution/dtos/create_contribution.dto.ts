import { IsJSON, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateContributionDto {
    @IsNotEmpty()
    @IsJSON()
    data_label: JSON;

    @IsString()
    @MaxLength(100)
    data_information: string;
}
