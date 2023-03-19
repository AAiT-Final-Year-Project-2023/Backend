import { IsAlphanumeric, IsEnum, IsInt, IsJSON, IsNotEmpty, IsPositive, IsString, Max } from 'class-validator';
import { DataType } from 'src/common/defaults';

export class CreateDataDto {

    @IsEnum(DataType)
    datatype: DataType

    @IsNotEmpty()
    @IsString()
    @Max(100)
    src: string

    @IsNotEmpty()
    @IsJSON()
    label: JSON

    @IsNotEmpty()
    @IsAlphanumeric()
    @Max(100)
    information: string

    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    size: number
}
