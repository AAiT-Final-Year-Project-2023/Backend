import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DataType } from 'src/common/defaults';

export class UpdateFileExtensionDto {
    @IsOptional()
    @IsEnum(DataType)
    @IsNotEmpty()
    data_type: DataType;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    extension: string;
}
