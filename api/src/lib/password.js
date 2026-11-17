// Password hashing with bcryptjs (pure JS, so it installs without a compiler).

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
