// One shared PrismaClient for the whole process.
// Creating several of them opens several connection pools and Postgres complains.

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
