import {Prisma} from '@prisma/client';
import { merchantWithProfileInclude } from '../constants';


export type MerchantWithProfile = Prisma.MerchantGetPayload<{
    include: typeof merchantWithProfileInclude;
}>;