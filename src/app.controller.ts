import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Req,
    Res,
} from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorators/IsPublicRoute.decorator';
import { EmailService } from './email/email.service';
import { User } from './decorators/CurrentUser.decorator';
import { AuthorizedUserData } from './common/interfaces';
import { Roles } from './decorators/roles.decorator';
import { NotificationType, UserRole } from './common/defaults';
import { NotificationService } from './notification/notification.service';
import { UserService } from './user/user.service';
import { CreatePaymentDto } from './payment/dto/create-payment.dto';
import { PaymentplansService } from './paymentplan/paymentplan.service';
import { PaymentService } from './payment/payment.service';
@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly emailService: EmailService,
        private readonly userService: UserService,
        private readonly notificaitionService: NotificationService,
        private readonly paymentPlanService: PaymentplansService,
        private readonly paymentService: PaymentService,
    ) {}

    @Get('curr-user')
    async currUser(@User() user: AuthorizedUserData) {
        const currUser = await this.userService.findById(user.userId);
        return user;
    }

    @Public()
    @Get('test')
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

    @Post('test-accept-payment/:id')
    async bruh(
        @User() user: AuthorizedUserData,
        @Body() body: CreatePaymentDto,
        @Param('id', ParseUUIDPipe) paymentPlanId: string,
    ) {
        const currUser = await this.userService.findById(user.userId);
        const paymentPlan = await this.paymentPlanService.findById(
            paymentPlanId,
        );

        return await this.paymentService.initialize(
            paymentPlan,
            currUser,
            body,
        );
    }

    @Roles(UserRole.ADMIN)
    @Get('curr-user')
    getBye(@User() user: AuthorizedUserData) {
        return user;
    }
}
