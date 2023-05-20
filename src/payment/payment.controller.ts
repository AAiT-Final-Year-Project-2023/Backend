import { Controller, Post, Body, Get } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ChapaService, InitializeResponse } from 'chapa-nestjs';
import { Public } from 'src/decorators/IsPublicRoute.decorator';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Public()
    @Post()
    async create(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentService.create(createPaymentDto);
    }

    @Public()
    @Get('/banks')
    async getBanks(){
      return await this.paymentService.getBanks();
    }
}
