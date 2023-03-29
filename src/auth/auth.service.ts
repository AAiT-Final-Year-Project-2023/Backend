import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dtos/create_user.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async validateUser(username: string, password: string): Promise<any> {
        const user = await this.userService.findByUsername(username);
        const isMatch = this.isMatch(password, user.password);

        if (user && isMatch) {
            const { password, ...rest } = user;
            return rest;
        }

        return null;
    }

    async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(password, salt);
        return hash;
    }

    async isMatch(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }

    async signin(user: Omit<User, 'password'>) {
        const payload = { username: user.username, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async signup(user: CreateUserDto) {
        user.password = await this.hash(user.password);
        const newUser = await this.userService.create(user);
        return this.signin(newUser);
    }
}
