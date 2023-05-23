import * as bcrypt from 'bcrypt';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/user/dtos/create_user.dto';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { GoogleUserInfo } from 'src/common/interfaces';
import { CodeExpiration } from 'src/common/defaults';
import { EmailService } from 'src/email/email.service';
import { VerifyUserDto } from './dtos/verify_user.dto';
import { ResendVerificationCodeDto } from './dtos/resend_verification_code.dto';
import { ChangePasswordDto } from './dtos/change_password.dto';
import { VerifyChangePasswordDto } from './dtos/verify_change_password.dto';
import { generateCodeAndExpiration } from 'src/common/functions';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private emailService: EmailService,
    ) {}

    async validateUser(
        username: string,
        password: string,
    ): Promise<Omit<User, 'password'>> {
        const user = await this.userService.findByUsername(username);
        if (!user) return null;
        const isMatch = await this.isMatch(password, user.password);

        if (isMatch) {
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

    async googleSignin(user: GoogleUserInfo) {
        if (!user) return 'No user from google';
        console.log(user);

        const userExists: User = await this.userService.findByEmail(user.email);
        if (userExists) return await this.signin(userExists);

        const newUserDetails: CreateUserDto = {
            email: user.email,
            username: user.email.slice(0, user.email.lastIndexOf('@')),
            password: '',
        };
        const newUser = await this.userService.create(newUserDetails);
        await this.userService.update(newUser.id, {
            google_authenticated: true,
            email_is_valid: true,
            image: user.picture
        });

        return await this.signin(newUser);
    }

    async signin(user: Omit<User, 'password'>) {
        const payload = {
            username: user.username,
            sub: user.id,
            roles: user.roles,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async signup(user: CreateUserDto) {
        const { verificationCode, expiresIn } = generateCodeAndExpiration();
        const newUser = await this.userService.create(user);
        const password = await this.hash(user.password);
        await this.userService.update(newUser.id, {
            password,
            email_verification_code: verificationCode,
            email_verification_code_expiration: expiresIn,
        });
        await this.emailService.verifyEmail(
            newUser.email,
            newUser.username,
            verificationCode.toString(),
            expiresIn,
        );
        return {
            message: 'Email verification code sent to: ' + newUser.email,
        };
    }

    async verifyEmail(data: VerifyUserDto) {
        const user = await this.userService.findByEmail(data.email);
        if (!user) {
            throw new HttpException(
                'User not registered',
                HttpStatus.NOT_FOUND,
            );
        }

        if (user.email_is_valid) {
            throw new HttpException(
                'User already verified',
                HttpStatus.CONFLICT,
            );
        }

        const hasExpired =
            new Date() > new Date(user.email_verification_code_expiration);
        if (hasExpired) {
            throw new HttpException(
                'Verification code has expired',
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        if (data.code !== user.email_verification_code) {
            throw new HttpException(
                'Verification code is wrong',
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.userService.update(user.id, {
            email_is_valid: true,
            email_verification_code: null,
            email_verification_code_expiration: null,
        });

        return this.signin(user);
    }

    async resendEmailVerificationCode(data: ResendVerificationCodeDto) {
        const user = await this.userService.findByEmail(data.email);
        if (!user) {
            throw new HttpException(
                'User not registered',
                HttpStatus.NOT_FOUND,
            );
        }

        if (user.email_is_valid) {
            throw new HttpException(
                'User already verified',
                HttpStatus.CONFLICT,
            );
        }

        const { verificationCode, expiresIn } = generateCodeAndExpiration();
        const updated = await this.userService.update(user.id, {
            email_verification_code: verificationCode,
            email_verification_code_expiration: expiresIn,
        });

        this.emailService.verifyEmail(
            user.email,
            user.username,
            verificationCode.toString(),
            expiresIn,
        );
        return {
            message: 'Email verification code sent to: ' + user.email,
        };
    }

    async changePassword(userId: string, data: ChangePasswordDto) {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new HttpException(
                'User not registered',
                HttpStatus.NOT_FOUND,
            );
        }

        if (user.google_authenticated) {
            throw new HttpException(
                'Google authenticated users cannot set password',
                HttpStatus.BAD_REQUEST,
            );
        }

        const { verificationCode, expiresIn } = generateCodeAndExpiration();
        const new_password = await this.hash(data.password);
        await this.userService.update(user.id, {
            new_password,
            password_change_verification_code: verificationCode,
            password_change_code_expiration: expiresIn,
        });
        this.emailService.changePassword(
            user.email,
            user.username,
            verificationCode.toString(),
            expiresIn,
        );
        return {
            message: 'Password change verification code sent to: ' + user.email,
        };
    }

    async verifyChangePassword(
        userId: string,
        data: VerifyChangePasswordDto,
    ): Promise<string> {
        const user = await this.userService.findById(userId);
        if (!user) {
            throw new HttpException(
                'User not registered',
                HttpStatus.NOT_FOUND,
            );
        }

        if (!user.new_password) {
            throw new HttpException(
                'No new password set',
                HttpStatus.BAD_REQUEST,
            );
        }

        const hasExpired =
            new Date() > new Date(user.password_change_code_expiration);
        if (hasExpired) {
            throw new HttpException(
                'Verification code has expired',
                HttpStatus.NOT_ACCEPTABLE,
            );
        }

        if (data.code !== user.password_change_verification_code) {
            throw new HttpException(
                'Verification code is wrong',
                HttpStatus.BAD_REQUEST,
            );
        }

        await this.userService.update(user.id, {
            password: user.new_password,
            new_password: null,
            password_change_verification_code: null,
            password_change_code_expiration: null,
        });

        return 'new password successfully set';
    }
}
