import { IsJSON, IsNotEmpty, IsString, IsUUID, Max } from 'class-validator';
import { RequestPostExists } from 'src/decorators/RequestPostExists.decorator';

export class CreateContributionDto {
    @IsNotEmpty()
    @IsUUID()
    @RequestPostExists()
    request_post: string;

    @IsNotEmpty()
    @IsJSON()
    data_label: JSON;

    @IsString()
    @Max(100)
    data_information: string;
}
