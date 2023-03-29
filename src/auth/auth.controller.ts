import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Public } from 'src/decorators/IsPublicRoute.decorator';
import { CreateUserDto } from 'src/user/dtos/create_user.dto';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';

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
}
