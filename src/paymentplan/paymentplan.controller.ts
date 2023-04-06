import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    ParseUUIDPipe,
} from '@nestjs/common';
import { PaymentPlan } from './paymentplan.entity';
import { CreatePaymentplanDto } from './dtos/create_paymentplan.dto';
import { UpdatePaymentplanDto } from './dtos/update_paymentplan.dto';
import { PaymentplansService } from './paymentplan.service';
import { Role } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/common/defaults';

@Controller('paymentplan')
export class PaymentplanController {
    constructor(private paymentplanService: PaymentplansService) {}

    @Role(UserRole.ADMIN)
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
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<PaymentPlan> {
        return this.paymentplanService.findById(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() body: UpdatePaymentplanDto,
    ): Promise<PaymentPlan> {
        return this.paymentplanService.update(id, body);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<PaymentPlan> {
        return this.paymentplanService.remove(id);
    }
}
