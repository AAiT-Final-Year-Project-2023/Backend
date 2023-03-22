import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DataType } from 'src/common/defaults';

export class CreateFileExtension {
    @IsEnum(DataType)
    @IsNotEmpty()
    data_type: DataType

    @IsString()
    @IsNotEmpty()
    extension: string
}