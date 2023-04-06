import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators/IsPublicRoute.decorator';
import { CreateUserDto } from 'src/user/dtos/create_user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { Request } from 'express';

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
    @Get('google/signin')
    @UseGuards(GoogleOAuthGuard)
    async googleAuth(@Req() req: any) {}

    @Public()
    @Get('google/redirect')
    @UseGuards(GoogleOAuthGuard)
    googleAuthRedirect(@Req() req: Request) {
        return this.authService.googleSignin(req);
    }
}
