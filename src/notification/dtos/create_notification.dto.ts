import {
    IsEnum,
    IsNotEmpty,
    IsString,
    IsUUID,
    MaxLength,
} from 'class-validator';
import { NotificationType } from 'src/common/defaults';
import { UserExists } from 'src/decorators/UserExists.decorator';

export class CreateNotificationDto {
    @IsUUID()
    @IsNotEmpty()
    @UserExists()
    user: string;

    @IsUUID()
    @IsNotEmpty()
    @UserExists()
    from_user: string;

    @IsEnum(NotificationType)
    @IsNotEmpty()
    title: NotificationType;
}
