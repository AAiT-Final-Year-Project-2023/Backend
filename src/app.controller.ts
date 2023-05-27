import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/IsPublicRoute.decorator';
import { EmailService } from './email/email.service';
import { User } from './decorators/CurrentUser.decorator';
import { AuthorizedUserData } from './common/interfaces';
import { Roles } from './decorators/roles.decorator';
import { NotificationType, UserRole } from './common/defaults';
import { Response, application } from 'express';
import { createReadStream, statSync } from 'fs';
import { NotificationService } from './notification/notification.service';
import { UserService } from './user/user.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly emailService: EmailService,
        private readonly userService: UserService,
        private readonly notificaitionService: NotificationService,
    ) {}

    @Get('curr-user')
    currUser(@User() user) {
        return user;
    }

    // @Get('test')
    // @Public()
    // async getHello(
    //     @User() user: AuthorizedUserData,
    //     @Req() req: any,
    //     @Res() res: Response,
    // ) {
    //     const filename =
    //         './uploads/profile_images/1684660805123-20e59c81-6a8a-498a-a743-ff5264f7e42e-066_dppi_40013259_061_109f650ffbbcd2534445741d67511bec.jpg';
    //     const stats = statSync(filename);

    //     res.set('Content-Type', 'application/octate-stream');
    //     res.set('Content-Disposition', `attachment; filename=${filename}`);
    //     res.set('Content-Length');
    //     res.set('Content-Length', stats.size.toString());
    //     const fileStream = createReadStream(filename);
    //     // fileStream.pipe(res);
    //     return user;
    // }

    @Get('test')
    @Public()
    async getHello(
        @User() user: AuthorizedUserData,
        // @Req() req: any,
        // @Res() res: Response,
    ) {
        const from = await this.userService.findById(
            'd04a68ef-b639-47e0-895f-9796a51c065a',
        );
        const to = await this.userService.findById(
            '20e59c81-6a8a-498a-a743-ff5264f7e42e',
        );
        return await this.notificaitionService.create({
            title: NotificationType.CONTRIBUTION_ACCEPTED,
            from,
            to,
            describtion: 'This is the desc',
        });
    }

    @Roles(UserRole.ADMIN)
    @Get('for-admin')
    getBye(@User() user: AuthorizedUserData) {
        return user;
    }
}
