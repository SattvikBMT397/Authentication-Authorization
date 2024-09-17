import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from 'src/user/repositories/user-repository';
import { CreateUserDto } from './dto/sign-up-dto';
import { SUCCESS_MESSAGES } from 'src/user/messages/success-messges-constant';
import { ERROR_MESSAGES } from 'src/user/messages/error-messages-constant';
import { LoginDto } from './dto/login-dto';
import { CreateUserResponse, LoginUserResponse } from 'src/user/utils/success-response';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '../enum/permission-enum';

@Injectable()
export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private jwtService: JwtService,
    ) { }


    async validateUser(userData: LoginDto): Promise<LoginUserResponse> {
        const { email, password } = userData;
        try {
            const user = await this.userRepository.findOneByEmail(email);
            if (!user) {
                throw new BadRequestException(ERROR_MESSAGES.USER_NOT_FOUND)
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new BadRequestException(ERROR_MESSAGES.INVALID_CREDENTIALS)
            }

            if (user.status === UserStatus.INACTIVE) {
                throw new BadRequestException(ERROR_MESSAGES.USER_INACTIVE)
            }
            const token = this.jwtService.sign({ id: user.id, role: user.role.name },{
                secret:"HELLO"
            });
            return { message: SUCCESS_MESSAGES.USER_LOGGEDIN, user, token };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw new BadRequestException(error.message)
            }
            throw new InternalServerErrorException(error);
        }
    }

}
