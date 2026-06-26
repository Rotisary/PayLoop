import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticationContext } from '../types/auth/authentication-context.type';


export const CurrentApiAuth = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticationContext => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);