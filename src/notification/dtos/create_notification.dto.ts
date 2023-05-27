import { Optional } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { NotificationType } from 'src/common/defaults';
import { UserExists } from 'src/decorators/UserExists.decorator';
import { User } from 'src/user/user.entity';

export class CreateNotificationDto {
    @IsUUID()
    @IsNotEmpty()
    @UserExists()
    to: User;

    @IsUUID()
    @IsNotEmpty()
    @UserExists()
    from: User;

    @IsString()
    describtion: string;

    @IsEnum(NotificationType)
    @IsNotEmpty()
    title: NotificationType;
}
