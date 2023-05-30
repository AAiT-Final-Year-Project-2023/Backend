import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create_user.dto';
import { User } from './user.entity';
import { UserRole } from 'src/common/defaults';

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private repo: Repository<User>) {}

    async create(user: CreateUserDto): Promise<Omit<User, 'password'>> {
        const newUser = this.repo.create(user);
        await this.repo.save(newUser);
        const { password, ...rest } = newUser;
        return rest;
    }

    async findById(id: string): Promise<User> {
        return this.repo.findOne({
            where: {
                id,
            },
            relations: ['bank_information'],
        });
    }

    async findByUsername(username: string): Promise<User> {
        return this.repo.findOne({
            where: {
                username,
            },
        });
    }

    async findByEmail(email: string): Promise<User> {
        return this.repo.findOne({
            where: {
                email,
            },
        });
    }

    async findAdmins(): Promise<User[]> {
        return this.repo
            .createQueryBuilder('user')
            .where(`'${UserRole.ADMIN}' = ANY (user.roles)`)
            .getMany();
    }

    async update(
        id: string,
        attrs: Partial<User>,
    ): Promise<Omit<User, 'password'>> {
        const user = await this.findById(id);
        if (!user)
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        Object.assign(user, attrs);
        const newUser = await this.repo.save(user);
        const { password, ...rest } = newUser;
        return rest;
    }

    async remove(id: string): Promise<Omit<User, 'password'>> {
        const user = await this.findById(id);
        if (!user)
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        return this.repo.remove(user);
    }
}
