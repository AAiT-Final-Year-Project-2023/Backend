import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './payment.entity';
import {
    ChapaService,
    GetBanksResponse,
    InitializeResponse,
    VerifyResponse,
} from 'chapa-nestjs';

@Injectable()
export class PaymentService {
    constructor(private readonly chapaService: ChapaService) {}

    async create(createPaymentDto: CreatePaymentDto) {
        // get the payment plan ID
        // get the

        const tx_ref = await this.chapaService.generateTransactionReference();

        console.log('tx_ref: ', tx_ref);

        // save this to the database

        const response: InitializeResponse = await this.chapaService.initialize(
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@gmail.com',
                currency: 'ETB',
                amount: '200',
                tx_ref: tx_ref,
                callback_url: 'https://example.com/',
                return_url: 'https://example.com/',
                customization: {
                    title: 'Test Title',
                    description: 'Test Description',
                },
            },
        );

        console.log(response);
        return 'This action adds a new payment';
    }

    async verify(tx_ref: string) {
        const response: VerifyResponse = await this.chapaService.verify({
            tx_ref,
        });
    }

    async getBanks(): Promise<GetBanksResponse> {
        const response = await this.chapaService.getBanks();
        return response;
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
