import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankInformation } from './bankinformation.entity';
import { Repository } from 'typeorm';
import { CreateBankinformationDto } from './dtos/create_bankinformation.dto';

@Injectable()
export class BankinformationService {
    constructor(
        @InjectRepository(BankInformation)
        private repo: Repository<BankInformation>,
    ) {}

    async create(
        bankinformation: CreateBankinformationDto,
    ): Promise<BankInformation> {
        const newBankInformation = this.repo.create(bankinformation);
        return await this.repo.save(newBankInformation);
    }

    async findOne(id: string): Promise<BankInformation> {
        return await this.repo.findOne({
            where: { id },
        });
    }

    async update(
        id: string,
        attrs: Partial<BankInformation>,
    ): Promise<BankInformation> {
        const bankInformation = await this.findOne(id);
        if (!bankInformation)
            throw new HttpException(
                'Bank information not found',
                HttpStatus.NOT_FOUND,
            );

        Object.assign(bankInformation, attrs);
        return this.repo.save(bankInformation);
    }

    async remove(id: string): Promise<BankInformation> {
        const bankInformation = await this.findOne(id);
        if (!bankInformation)
            throw new HttpException(
                'Bank information not found',
                HttpStatus.NOT_FOUND,
            );

        return this.repo.remove(bankInformation);
    }
}
