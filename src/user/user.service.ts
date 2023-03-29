import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create_user.dto';
import { User } from './user.entity';

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
        });
    }

    async findByUsername(username: string): Promise<User> {
        return this.repo.findOne({
            where: {
                username,
            },
        });
    }
}
