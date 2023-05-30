import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankInformation } from './bankinformation.entity';
import { Repository } from 'typeorm';
import { CreateBankinformationDto } from './dtos/create_bankinformation.dto';
import { User } from 'src/user/user.entity';
import { async } from 'rxjs';

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

    async remove(user: User): Promise<BankInformation> {
        const bankInformation = user.bank_information; 
        if (!bankInformation)
            throw new HttpException(
                'Bank information not found',
                HttpStatus.NOT_FOUND,
            );

        await this.repo.manager.transaction(async (manager) => {
            user.bank_information = null;
            await manager.save(user);
            await manager.remove(bankInformation);
        });
        return bankInformation;
    }
}
