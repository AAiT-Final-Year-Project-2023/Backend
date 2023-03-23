import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentplanDto } from './dtos/create_paymentplan.dto';
import { PaymentPlan } from './paymentplan.entity';

@Injectable()
export class PaymentplansService {
    constructor(
        @InjectRepository(PaymentPlan)
        private repo: Repository<PaymentPlan>,
    ) {}

    async create(paymentplan: CreatePaymentplanDto): Promise<PaymentPlan> {
        const newPaymentPlan = await this.repo.create(paymentplan);
        return this.repo.save(newPaymentPlan);
    }

    async find(): Promise<PaymentPlan[]> {
        return this.repo.find();
    }

    async findOne(id: number): Promise<PaymentPlan> {
        return this.repo.findOne({ where: { id } });
    }

    async update(
        id: number,
        attrs: Partial<PaymentPlan>,
    ): Promise<PaymentPlan> {
        const paymentplan = await this.findOne(id);
        if (!paymentplan)
            throw new HttpException(
                'Payment Plan not found',
                HttpStatus.NOT_FOUND,
            );
        Object.assign(paymentplan, attrs);
        return this.repo.save(paymentplan);
    }

    async remove(id: number): Promise<PaymentPlan> {
        const paymentplan = await this.findOne(id);
        if (!paymentplan)
            throw new HttpException(
                'Payment Plan not found',
                HttpStatus.NOT_FOUND,
            );
        return this.repo.remove(paymentplan);
    }
}
