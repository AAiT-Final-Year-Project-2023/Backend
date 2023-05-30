import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Patch,
    Post,
} from '@nestjs/common';
import { Public } from 'src/decorators/IsPublicRoute.decorator';
import { PaymentService } from 'src/payment/payment.service';
import { CreateBankinformationDto } from './dtos/create_bankinformation.dto';
import { AuthorizedUserData } from 'src/common/interfaces';
import { User } from 'src/decorators/CurrentUser.decorator';
import { BankInformation } from './bankinformation.entity';
import { UserService } from 'src/user/user.service';
import { BankinformationService } from './bankinformation.service';
import { UpdateBankinformationDto } from './dtos/update_bankinformation.dto';

@Controller('bankinformation')
export class BankinformationController {
    constructor(
        private bankInformationService: BankinformationService,
        private paymentService: PaymentService,
        private userService: UserService,
    ) {}

    @Public()
    @Get('/banks')
    async getBanks() {
        return this.paymentService.getBanks();
    }

    @Post('/')
    async create(
        @Body() body: CreateBankinformationDto,
        @User() user: AuthorizedUserData,
    ): Promise<BankInformation> {
        const currUser = await this.userService.findById(user.userId);
        if (!currUser)
            throw new HttpException(
                'User not found',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        const newBankInformation = await this.bankInformationService.create(
            body,
        );
        if (!newBankInformation)
            throw new HttpException(
                'Error creating new bank information',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        const updatedUser = await this.userService.update(user.userId, {
            bank_information: newBankInformation,
        });
        if (!updatedUser)
            throw new HttpException(
                'Error creating new bank information',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );

        return newBankInformation;
    }

    @Get('/')
    async getBankInfo(
        @User() user: AuthorizedUserData,
    ): Promise<BankInformation> {
        const currUser = await this.userService.findById(user.userId);
        if (!currUser)
            throw new HttpException(
                'User not found',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        return currUser.bank_information;
    }

    @Patch()
    async update(
        @Body() body: UpdateBankinformationDto,
        @User() user: AuthorizedUserData,
    ): Promise<BankInformation> {
        const currUser = await this.userService.findById(user.userId);
        if (!currUser)
            throw new HttpException(
                'User not found',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        if (!currUser.bank_information)
            throw new HttpException(
                'Bank information not set',
                HttpStatus.NOT_FOUND,
            );
        return await this.bankInformationService.update(
            currUser.bank_information.id,
            body,
        );
    }

    @Delete()
    async delete(@User() user: AuthorizedUserData): Promise<BankInformation> {
        const currUser = await this.userService.findById(user.userId);
        if (!currUser)
            throw new HttpException(
                'User not found',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        if (!currUser.bank_information)
            throw new HttpException(
                'Bank information not set',
                HttpStatus.NOT_FOUND,
            );

        return await this.bankInformationService.remove(currUser);
    }
}
