import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './payment.entity';
import {
    ChapaService,
    GetBanksResponse,
    InitializeOptions,
    InitializeResponse,
    VerifyResponse,
} from 'chapa-nestjs';
import { PaymentPlan } from 'src/paymentplan/paymentplan.entity';
import { User } from 'src/user/user.entity';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosError, AxiosResponse } from 'axios';

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment) private repo: Repository<Payment>,
        private readonly chapaService: ChapaService,
        private readonly config: ConfigService,
    ) {}

    async initialize(
        paymentPlan: PaymentPlan,
        user: User,
        body: CreatePaymentDto,
    ) {
        const tx_ref = await this.chapaService.generateTransactionReference();

        const payment = this.repo.create({
            tx_ref,
            user: user.id,
            payment_plan: paymentPlan.id,
        });

        const callback_url = `${this.config.get<string>(
            'PROTOCOL',
        )}://${this.config.get<string>('HOST')}:${this.config.get<string>(
            'PORT',
        )}/api/payment/verify`;

        const headers = {
            Authorization: `Bearer ${this.config.get<string>(
                'PRIVATE_CHAPA_API_KEY',
            )}`,
            'Content-Type': 'application/json',
        };

        //  const data = {
        //     amount: paymentPlan.price.toString().slice(2),
        //     currency: 'ETB',
        //     email: user.email,
        //     phone_number: body.phone,
        //     tx_ref,
        //     callback_url,
        // };

        const data = {
            amount: '100',
            currency: 'ETB',
            email: 'abebech_bekele@gmail.com',
            first_name: 'Bilen',
            last_name: 'Gizachew',
            phone_number: '0912345678',
            tx_ref: 'chewatatest-6669',
            callback_url,
            return_url: 'https://www.google.com/',
            'customization[title]': 'Payment for my favourite merchant',
            'customization[description]': 'I love online payments.',
        };

        console.log(data);

        try {
            const response: AxiosResponse = await axios.post(
                'https://api.chapa.co/v1/transaction/initialize',
                data,
                {
                    headers,
                },
            );
            return response.data;
        } catch (error) {
            console.log((error as AxiosError).toJSON());
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async verify(tx_ref: string) {
        const response: VerifyResponse = await this.chapaService.verify({
            tx_ref,
        });
    }

    async getBanks(): Promise<GetBanksResponse> {
        try {
            const response = await this.chapaService.getBanks();
            return response;
        } catch (e) {
            throw new HttpException(
                'Could not get supported banks: ' + e?.message,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    findAll() {
        return `This action returns all payment`;
    }

    findOne(id: number) {
        return `This action returns a #${id} payment`;
    }

    update(id: number, attrs: Partial<Payment>) {
        return `This action updates a #${id} payment`;
    }

    remove(id: number) {
        return `This action removes a #${id} payment`;
    }
}
