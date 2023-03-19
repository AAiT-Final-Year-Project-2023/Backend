import { ArrayMaxSize, IsAlphanumeric, IsArray, IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { DataType } from 'src/common/defaults';

export class RequestPostDto {

    @IsNotEmpty()
    @IsNumber()
    user: number

    @IsNotEmpty()
    @IsNumber()
    payment_plan: number

    @IsAlphanumeric()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(50)
    title: string

    @IsString()
    @IsNotEmpty()
    @Length(50, 500)
    description: string

    // ?? WHYYYYY
    @IsArray()
    @IsString({ each: true })
    @MaxLength(30 , { each: true })
    @ArrayMaxSize(10)
    labels: string[]

    @IsString()
    @IsNotEmpty()
    @Length(50, 500)
    guidelines: string


    @IsEnum(DataType)
    datatype: DataType

    // PROBLEM
    extension: string

    // In KBs
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    data_size: number

    // In birr
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    payment: number


    @IsNotEmpty()
    @IsDate()
    deadline: Date
}
