import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedMerchant } from '../types/auth/authenticated-merchant.type';


export const CurrentMerchant = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedMerchant => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);