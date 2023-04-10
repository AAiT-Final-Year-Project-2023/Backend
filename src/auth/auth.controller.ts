import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators/IsPublicRoute.decorator';
import { CreateUserDto } from 'src/user/dtos/create_user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { Request } from 'express';
import { AuthorizedUserData, GoogleUserInfo } from 'src/common/interfaces';
import { VerifyUserDto } from './dtos/verify_user.dto';
import { ResendVerificationCodeDto } from './dtos/resend_verification_code.dto';
import { User } from 'src/decorators/CurrentUser.decorator';
import { ChangePasswordDto } from './dtos/change_password.dto';
import { VerifyChangePasswordDto } from './dtos/verify_change_password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('signin')
    async signin(@Req() req: any) {
        return this.authService.signin(req.user);
    }

    @Public()
    @Post('signup')
    async signup(@Body() user: CreateUserDto) {
        return this.authService.signup(user);
    }

    @Public()
    @Post('verify')
    async verify(@Body() body: VerifyUserDto) {
        return this.authService.verifyEmail(body);
    }

    @Public()
    @Post('resend-verification-code')
    async resendVerificationCode(@Body() body: ResendVerificationCodeDto) {
        return this.authService.resendEmailVerificationCode(body);
    }

    @Post('change-password')
    async changePassword(@User() user: AuthorizedUserData, @Body() data: ChangePasswordDto) {
        return this.authService.changePassword(user.userId, data);
    }

    @Post('verify-change-password')
    async verifyChangePassword(
        @User() user: AuthorizedUserData,
        @Body() data: VerifyChangePasswordDto,
    ) {
        return this.authService.verifyChangePassword(user.userId, data);
    }

    @Public()
    @Get('google/signin')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth(@Req() req: any) {}

    @Public()
    @Get('google/redirect')
    @UseGuards(GoogleOAuthGuard)
    googleAuthRedirect(@Req() req: Request) {
        return this.authService.googleSignin(req.user as GoogleUserInfo);
    }
}
