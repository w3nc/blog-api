// Login controller: check the username and password, hand back a JWT.

import { comparePassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { HttpError } from '../lib/http-error.js';

export function makeAuthController(prisma, config) {
  const login = async (req, res, next) => {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    // Deliberately the same message for "no such user" and "wrong password":
    // telling them apart would let anyone probe for real usernames.
    if (!user) return next(new HttpError(401, 'Wrong username or password.'));

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return next(new HttpError(401, 'Wrong username or password.'));

    const token = signToken(user, config);
    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role },
    });
  };

  // GET /auth/me -> handy for the dashboard to restore a session after refresh.
  const me = async (req, res) => {
    res.json({ user: req.user });
  };

  return { login, me };
}
