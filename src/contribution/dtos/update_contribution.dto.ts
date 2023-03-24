import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateContributionDto {
    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    request_post: number;

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    data: number;
}
