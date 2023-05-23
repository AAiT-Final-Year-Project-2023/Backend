import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import validate from 'deep-email-validator';

@Injectable()
export class EmailService {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
    ) {}

    async isValidEmail(email: string) {
        return await validate(email);
    }

    async verifyEmail(
        to_email: string,
        username: string,
        code: string,
        expiration: Date,
    ) {
        const response = await this.mailerService.sendMail({
            to: to_email,
            from: this.configService.get<'string'>('EMAIL_USER'),
            subject: 'Verify Email',
            template: 'verify_email',
            context: {
                code,
                username,
                expiration,
            },
        });
        return response;
    }

    async changePassword(
        to_email: string,
        username: string,
        code: string,
        expiration: Date,
    ) {
        const response = await this.mailerService.sendMail({
            to: to_email,
            from: this.configService.get<'string'>('EMAIL_USER'),
            subject: 'Change Password',
            template: 'change_password',
            context: {
                code,
                username,
                expiration,
            },
        });
        return response;
    }
}
