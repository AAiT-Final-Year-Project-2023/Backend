import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
} from '@nestjs/common';
import { AuthorizedUserData } from 'src/common/interfaces';
import { User } from 'src/decorators/CurrentUser.decorator';
import { UserService } from 'src/user/user.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentplansService } from 'src/paymentplan/paymentplan.service';
import { PaymentService } from './payment.service';
import { Public } from 'src/decorators/IsPublicRoute.decorator';

@Controller('payment')
export class PaymentController {
    constructor(
        private userService: UserService,
        private paymentPlanService: PaymentplansService,
        private paymentService: PaymentService,
    ) {}

    @Post('purchase-plan/:id')
    async acceptPayment(
        @User() user: AuthorizedUserData,
        @Body() body: CreatePaymentDto,
        @Param('id', ParseUUIDPipe) paymentPlanId: string,
    ) {
        const currUser = await this.userService.findById(user.userId);
        const paymentPlan = await this.paymentPlanService.findById(
            paymentPlanId,
        );
        if (!paymentPlan)
            throw new HttpException(
                'Payment plan not found',
                HttpStatus.NOT_FOUND,
            );

        return await this.paymentService.initialize(
            paymentPlan,
            currUser,
            body,
        );
    }

    @Public()
    @Get('verify')
    async verify(@Body() body: any) {
        console.log(body);
        return await this.paymentService.verify(body.tx_ref);
    }
}
