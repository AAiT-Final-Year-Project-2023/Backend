import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateContributionDto {
    @IsNotEmpty()
    @IsUUID()
    request_post: string;

    @IsNotEmpty()
    @IsUUID()
    data: string;
}
