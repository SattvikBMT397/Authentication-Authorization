import { Body, Controller, Get, HttpCode, HttpStatus, Post, } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';
import { LoginUserResponse } from 'src/user/utils/success-response';
import { Public } from './decorator/public.decorator';


@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('/login')
    login(@Body() loginDto: LoginDto): Promise<LoginUserResponse> {
        return this.authService.validateUser(loginDto);
    }
}