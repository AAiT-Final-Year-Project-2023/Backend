import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/IsPublicRoute.decorator';
import { EmailService } from './email/email.service';
import { User } from './decorators/CurrentUser.decorator';
import { AuthorizedUserData } from './common/interfaces';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './common/defaults';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly emailService: EmailService,
    ) {}

    @Get('curr-user')
    currUser(@User() user) {
        return user;
    }

    @Post('test')
    @Public()
    getHello(@User() user: AuthorizedUserData, @Req() req: any) {
        console.log(req.body);
        return user;
    }

    @Roles(UserRole.ADMIN)
    @Get('for-admin')
    getBye(@User() user: AuthorizedUserData) {
        return user;
    }
}
