import {
    Controller,
    Delete,
    HttpException,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Put,
} from '@nestjs/common';
import { AuthorizedUserData } from 'src/common/interfaces';
import { User } from 'src/decorators/CurrentUser.decorator';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    @Put('read/:id')
    async read(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: AuthorizedUserData,
    ) {
        const notification = await this.notificationService.findById(id);
        if (!notification)
            throw new HttpException(
                'Notification not found',
                HttpStatus.NOT_FOUND,
            );

        if (user.userId !== notification.user)
            throw new HttpException(
                'User not authorized',
                HttpStatus.UNAUTHORIZED,
            );
        return this.notificationService.update(id, {
            seen: true,
        });
    }

    @Delete(':id')
    async remove(
        @Param('id', ParseUUIDPipe) id: string,
        @User() user: AuthorizedUserData,
    ) {
        const notification = await this.notificationService.findById(id);
        if (!notification)
            throw new HttpException(
                'Notification not found',
                HttpStatus.NOT_FOUND,
            );

        if (user.userId !== notification.user)
            throw new HttpException(
                'User not authorized',
                HttpStatus.UNAUTHORIZED,
            );

        return this.notificationService.remove(id);
    }
}
