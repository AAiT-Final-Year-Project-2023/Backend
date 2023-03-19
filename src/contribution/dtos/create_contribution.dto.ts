import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateContributionDto {
    @IsNotEmpty()
    @IsNumber()
    user: number

    @IsNotEmpty()
    @IsNumber()
    request_post: number

    @IsNotEmpty()
    @IsNumber()
    data: number

}