import {Prisma } from '@prisma/client';

export const merchantWithProfileInclude = 
Prisma.validator<Prisma.MerchantInclude>()(
    {profile: true}
);