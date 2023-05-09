import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthorizedUserData } from 'src/common/interfaces';

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AuthorizedUserData => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);
