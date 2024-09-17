import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { ERROR_MESSAGES } from 'src/user/messages/error-messages-constant';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        // console.log(token);
        if (!token) {
            throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_NOT_FOUND);
        }
        try { 
            const user = await this.jwtService.verify(token, {
                secret:"HELLO",
            });
            // console.log("w2",user);
            request.user = user;
        } catch {
            throw new UnauthorizedException(ERROR_MESSAGES.INVALID_TOKEN);
        }
        return true;

    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}