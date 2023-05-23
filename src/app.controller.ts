import { Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/IsPublicRoute.decorator';
import { EmailService } from './email/email.service';
import { User } from './decorators/CurrentUser.decorator';
import { AuthorizedUserData } from './common/interfaces';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './common/defaults';
import { AuthService } from './auth/auth.service';
import { generateCodeAndExpiration } from './common/functions';

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
    async getHello(@User() user: AuthorizedUserData, @Req() req: any) {
        // const { verificationCode, expiresIn } = generateCodeAndExpiration();
        // // await this.emailService.changePassword(
        // //     '1segniadebatasisa@gmail.com',
        // //     '1segniadebatasisa',
        // //     verificationCode,
        // //     expiresIn
        // // );
        // await this.emailService.verifyEmail(
        //     '1segniadebatasisa@gmail.com',
        //     '1segniadebatasisa',
        //     verificationCode,
        //     expiresIn,
        // );
        return user;
    }

    @Roles(UserRole.ADMIN)
    @Get('for-admin')
    getBye(@User() user: AuthorizedUserData) {
        return user;
    }
}
