import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class UpdateContributionDto {
    @IsOptional()
    @IsNotEmpty()
    @IsUUID()
    request_post: string;

    @IsOptional()
    @IsNotEmpty()
    @IsUUID()
    data: string;
}
