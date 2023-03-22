import {
    IsJSON,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
} from 'class-validator';

export class UpdateDataDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Max(100)
    src: string;

    @IsOptional()
    @IsNotEmpty()
    @IsJSON()
    label: JSON;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @Max(100)
    information: string;
}
