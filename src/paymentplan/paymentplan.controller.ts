import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from '@nestjs/common';
import { PaymentPlan } from './paymentplan.entity';
import { CreatePaymentplanDto } from './dtos/create_paymentplan.dto';
import { UpdatePaymentplanDto } from './dtos/update_paymentplan.dto';
import { PaymentplansService } from './paymentplan.service';

@Controller('paymentplan')
export class PaymentplanController {
    constructor(private paymentplanService: PaymentplansService) {}

    @Post()
    async create(@Body() body: CreatePaymentplanDto): Promise<PaymentPlan> {
        return this.paymentplanService.create(body);
    }

    @Get()
    async find(): Promise<PaymentPlan[]> {
        return this.paymentplanService.find();
    }

    @Get(':id')
    async findById(
        @Param('id', ParseIntPipe) id: number,
    ): Promise<PaymentPlan> {
        return this.paymentplanService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: UpdatePaymentplanDto,
    ): Promise<PaymentPlan> {
        return this.paymentplanService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number): Promise<PaymentPlan> {
        return this.paymentplanService.remove(id);
    }
}
