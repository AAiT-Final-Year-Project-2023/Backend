import {
    IsJSON,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';

export class UpdateContributionDto {
    @IsOptional()
    @IsNotEmpty()
    @IsJSON()
    label: JSON;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    information: string;
}
