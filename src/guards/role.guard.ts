import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/defaults';
import { ROLE_KEY } from 'src/decorators/roles.decorator';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRole = this.reflector.getAllAndOverride<UserRole>(
            ROLE_KEY,
            [context.getHandler(), context.getClass()],
        );
        if (!requiredRole) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        return requiredRole == user.role;
    }
}
